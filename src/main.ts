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
import { Role } from "./roles/defineRole";
import { definedRoles } from "./roles/definitions";
import { createTask, Task } from "./tasks/createTask";
import { definedTasks } from "./tasks/definitions";
import { hasNoValue, hasValue, TypedId } from "./uitls";
import { getMaximalScaledBodyParts } from "./roles/bodyComposition";
import { TaskPriority } from "./tasks/priority";
import { ACCEPTABLE_HITS_LOSS } from "./constants";
import { repairStructuresTaskDefinition } from "./tasks/definitions/repair-structures";
import {
  Colony,
  initializeColony,
  loadColonies,
  storeColony,
} from "./colony/colony";
import { Resolver } from "./resolver";
import { definedColonyStages } from "./colony/stages";

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
}

function spawnCreep(role: Role, spawn: StructureSpawn) {
  const availableEnergy = spawn.room.energyAvailable;

  const bodyPartsResult = getMaximalScaledBodyParts(
    role.bodyComposition,
    availableEnergy,
  );

  if (bodyPartsResult.isOk()) {
    spawn.spawnCreep(
      bodyPartsResult.value,
      `${role.name}-${Game.time}-${Math.random().toString(36)}`,
      {
        memory: {
          role: role.name,
          assignedTask: null,
        },
      },
    );
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

function getUnfinishedTasks() {
  const tasks = getTasks();

  const unfinishedTasks = omitBy(tasks, (task) => {
    const definition = definedTasks[task.type];

    if (definition.isFinished?.(task.parameters as any)) {
      console.log(
        `[INFO][TASK:${task.type}]: Task finished and removed from memory`,
      );
      const assignedCreep = task.assignedCreep;

      if (assignedCreep) {
        const creepMemory = getCreepMemory(assignedCreep);
        creepMemory.assignedTask = null;
      }

      return true;
    } else {
      return false;
    }
  });

  return unfinishedTasks;
}

function assignTaskToCreep(
  tasks: { [taskId: string]: Task },
  task: Task,
  creep: Creep,
) {
  const creepMemory = getCreepMemory(creep);
  const priorAssignedTaskId = creepMemory.assignedTask;
  const priorAssignedTask = tasks[priorAssignedTaskId ?? ""] ?? null;

  if (priorAssignedTask?.id === task.id) {
    return;
  }

  if (priorAssignedTask) {
    priorAssignedTask.assignedCreep = null;
  }

  creepMemory.assignedTask = task.id;

  if (task.assignedCreep && task.assignedCreep.name !== creep.name) {
    const priorAssignee = task.assignedCreep;
    const priorAssigneeMemory = getCreepMemory(priorAssignee);

    priorAssigneeMemory.assignedTask = null;
  }

  task.assignedCreep = creep;
}

function getRole(creep: Creep): Role {
  const roleName = getCreepMemory(creep).role;

  return definedRoles[roleName];
}

function assignTasksToCreeps(
  tasks: { [taskId: string]: Task },
  creeps: Creep[],
) {
  const unassignedTasksSortedByPriority = values(tasks)
    .filter((task) => !task.assignedCreep)
    .sort((a, b) => b.priority - a.priority);
  const creepsSortedByAssignedTask = creeps.sort((a, b) => {
    const aTaskId = getCreepMemory(a).assignedTask;
    const aTask = tasks[aTaskId ?? ""] ?? null;

    const bTaskId = getCreepMemory(b).assignedTask;
    const bTask = tasks[bTaskId ?? ""] ?? null;

    const aPriority = aTask ? aTask.priority : -1;
    const bPriority = bTask ? bTask.priority : -1;

    return aPriority - bPriority;
  });

  creepsSortedByAssignedTask.forEach((creep) => {
    const assignableTasks = unassignedTasksSortedByPriority.filter((task) => {
      const creepRole = getRole(creep);

      return includes(creepRole.assignableTaskTypes, task.type);
    });
    const nextPriorityTask = first(assignableTasks);

    if (hasNoValue(nextPriorityTask)) {
      return;
    }

    const creepMemory = getCreepMemory(creep);
    if (hasNoValue(creepMemory.assignedTask)) {
      assignTaskToCreep(tasks, nextPriorityTask, creep);
      unassignedTasksSortedByPriority.pop();
    } else {
      const assignedTask = tasks[creepMemory.assignedTask];

      if (assignedTask && assignedTask.priority < nextPriorityTask.priority) {
        assignTaskToCreep(tasks, nextPriorityTask, creep);
        unassignedTasksSortedByPriority.pop();
      }
    }
  });
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

  // Colony planning
  if (Game.time % 10 === 0) {
    values(colonies).forEach((colony) => {
      const newTasks =
        definedColonyStages[colony.currentStage].planNewTasks(colony);

      colony.tasks.push(...newTasks);
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
