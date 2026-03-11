import {
  first,
  includes,
  isEmpty,
  keyBy,
  keys,
  omitBy,
  partition,
  values,
} from "lodash-es";
import { cleanMemory, getCreepMemory, getTasks, saveTasks } from "./memory";
import { definedRoles, RoleName } from "./roles/definitions";
import { definedTasks } from "./tasks/definitions";
import { getNewId, hasNoValue, hasValue, TypedId } from "./uitls";
import {
  Colony,
  initializeColony,
  loadColonies,
  storeColony,
} from "./colony/colony";
import { Resolver } from "./resolver";
import { definedColonyStages } from "./colony/stages";
import { Task } from "./tasks/createTask";
import { getScaledBodyParts } from "./roles/bodyComposition";

const CURRENT_SCRIPT_VERSION = 1;

interface ScriptMeta {
  version: number;
  startTime: number;
}

declare global {
  interface Memory {
    __meta?: ScriptMeta;
    colonies?: Record<TypedId<Colony>, Colony>;
  }
  interface CreepMemory {
    role: RoleName;
    assignedTask: TypedId<Task> | null;
  }
}

function startLoop() {
  if (Memory.__meta?.version === CURRENT_SCRIPT_VERSION) {
    const colonies = loadColonies();

    return {
      colonies,
    };
  } else {
    const colonies = values(Game.rooms)
      .map((room) => (room.controller?.my ? initializeColony(room) : null))
      .filter(hasValue);

    Memory.__meta = {
      version: CURRENT_SCRIPT_VERSION,
      startTime: Game.time,
    };

    return {
      colonies: keyBy(colonies, (colony) => colony.id),
    };
  }
}

function endLoop(context: ReturnType<typeof startLoop>) {
  const { colonies } = context;

  values(colonies).forEach(storeColony);
}

export function loop() {
  const { colonies } = startLoop();

  // Colony execution
  values(colonies).forEach((colony) => {
    const resolvedTasksWithAssignee = colony.tasks
      .map((task) => {
        const resolvedAssignee = hasValue(task.assigneeId)
          ? Resolver.getCreep(task.assigneeId)
          : null;

        if (hasNoValue(resolvedAssignee)) {
          return null;
        } else {
          return {
            type: definedTasks[task.type],
            assignee: resolvedAssignee,
            task,
          };
        }
      })
      .filter(hasValue);

    const [finishedTasks, unfinishedTasks] = partition(
      resolvedTasksWithAssignee,
      ({ type, task }) => {
        if (type.isFinished?.(task.parameters as any)) {
          return false;
        } else {
          return true;
        }
      },
    );

    finishedTasks.forEach(({ task, assignee }) => {
      console.log(
        `[INFO][TASK:${task.type}]: Task finished and removed from colony`,
      );

      if (assignee) {
        const creepMemory = getCreepMemory(assignee);
        creepMemory.assignedTask = null;
      }
    });

    unfinishedTasks.forEach(({ type, assignee, task }) => {
      type.execute({
        creep: assignee,
        ...task.parameters,
      } as any);
    });
  });

  // 2.1 Cleaning up memory of non-existing creeps

  // 2.2 Execute colony planning
  if (Game.time % 10 === 0) {
    // Enriching the colony with its planning results
    values(colonies).forEach((colony) => {
      const newTasks =
        definedColonyStages[colony.currentStage].planNewTasks(colony);

      colony.tasks.push(...newTasks);
    });

    values(colonies).forEach((colony) => {
      const newSpawnIntents =
        definedColonyStages[colony.currentStage].planNewCreeps(colony);

      colony.spawnIntents.push(...newSpawnIntents);
    });

    // 2.3 Act on the planning results

    // Spawn creeps for spawn intents
    values(colonies).forEach((colony) => {
      const room = Resolver.getRoom(colony.room);
      const roomSpawner = room.find(FIND_MY_SPAWNS)[0];
      const spawnIntentToExecute = first(colony.spawnIntents);

      if (
        hasValue(spawnIntentToExecute) &&
        hasValue(roomSpawner) &&
        roomSpawner.spawning === null
      ) {
        const newCreepId = getNewId<Creep>(
          definedRoles[spawnIntentToExecute.role].name,
        );
        const scaledBodyParts = getScaledBodyParts(
          definedRoles[spawnIntentToExecute.role].bodyComposition,
          spawnIntentToExecute.targetLevel,
        );

        const spawnResult = roomSpawner.spawnCreep(
          scaledBodyParts,
          newCreepId,
          {},
        );

        if (spawnResult === OK) {
          colony.spawnIntents.pop();
          colony.creeps.push(newCreepId);
        }
      }
    });

    // Assign creeps to tasks
    // 1. Assign unassigned tasks to idle creeps
    // 2. Resign tasks based on: holds least important task and more important task is available (This must be a stable assignment)
    values(colonies).forEach((colony) => {
      const creeps = colony.creeps.map(Resolver.getCreep).filter(hasValue);
      const idleCreeps = creeps.filter(
        (creep) => creep.memory.assignedTask === null,
      );

      const unassignedTasks = colony.tasks
        .filter((task) => hasNoValue(task.assigneeId))
        .sort((a, b) => b.priority - a.priority);

      idleCreeps.forEach((creep) => {
        const taskToAssign = unassignedTasks.pop();

        if (hasValue(taskToAssign)) {
          creep.memory.assignedTask = taskToAssign.id;
          taskToAssign.assigneeId = creep.id;
        }
      });
    });
  }

  // Colony governance

  if (Game.time % 50 === 0) {
    const updatedColonies = values(colonies).map((colony) => {
      const currentStageDefinition = definedColonyStages[colony.currentStage];
      return currentStageDefinition.govern(colony);
    });

    endLoop({ colonies: keyBy(updatedColonies, (colony) => colony.id) });
  } else {
    endLoop({ colonies });
  }
}
