import { first, isEmpty, keyBy, keys, omitBy, values } from "lodash-es";
import { cleanMemory, getCreepMemory, getTasks, saveTasks } from "./memory";
import { Role } from "./roles/defineRole";
import { definedRoles } from "./roles/definitions";
import { createTask, Task } from "./tasks/createTask";
import { definedTasks } from "./tasks/definitions";
import { hasNoValue } from "./uitls";
import { getMaximalScaledBodyParts } from "./roles/bodyComposition";
import { TaskPriority } from "./tasks/priority";

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

function init() {
  const memory = Memory as { __initialized?: boolean };

  if (memory.__initialized) {
    return;
  }

  memory.__initialized = true;

  const mySpawn = Game.spawns["Spawn1"];
  const energySource = mySpawn?.room.find(FIND_SOURCES)[0];
  const controller = mySpawn?.room.controller;

  if (
    hasNoValue(mySpawn) ||
    hasNoValue(energySource) ||
    hasNoValue(controller)
  ) {
    return;
  }

  const startTasks = [
    createTask(
      definedTasks["upgrade-controller"],
      {
        target: controller.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.FALLBACK,
    ),
    createTask(
      definedTasks["upgrade-controller"],
      {
        target: controller.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.FALLBACK,
    ),
    createTask(
      definedTasks["upgrade-controller"],
      {
        target: controller.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.FALLBACK,
    ),
    createTask(
      definedTasks["upgrade-controller"],
      {
        target: controller.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.FALLBACK,
    ),
    createTask(
      definedTasks["upgrade-controller"],
      {
        target: controller.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.FALLBACK,
    ),
  ];

  saveTasks(keyBy(startTasks, (task) => task.id));

  console.log("[INFO]: Memory initialized with default tasks");

  const unifishedTasks = getUnfinishedTasks();

  console.log("DEV");
  keys(unifishedTasks).forEach((taskId) => {
    console.log(`- ${taskId}: ${unifishedTasks[taskId]?.type}`);
  });
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
    const nextPriorityTask = first(unassignedTasksSortedByPriority);

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
  init();

  const mySpawn = Game.spawns["Spawn1"];
  const energySource = mySpawn?.room.find(FIND_SOURCES)[0];
  const controller = mySpawn?.room.controller;

  if (
    hasNoValue(mySpawn) ||
    hasNoValue(energySource) ||
    hasNoValue(controller)
  ) {
    return;
  }

  const creeps = values(Game.creeps);

  const unfinishedTasks = getUnfinishedTasks();

  values(unfinishedTasks).forEach((task) => {
    if (task.assignedCreep) {
      const definition = definedTasks[task.type];

      definition.execute({
        creep: task.assignedCreep,
        ...(task.parameters as any),
      });
    }
  });

  if (
    !values(unfinishedTasks).some((task) => task.type === "fill-spawn") &&
    mySpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  ) {
    const fillSpawnTask = createTask(
      definedTasks["fill-spawn"],
      {
        target: mySpawn.id,
        energyOrigin: energySource.id,
      },
      TaskPriority.HIGH,
    );

    unfinishedTasks[fillSpawnTask.id] = fillSpawnTask;
  }

  const constructionSites = mySpawn.room.find(FIND_CONSTRUCTION_SITES);
  if (
    !isEmpty(constructionSites) &&
    values(unfinishedTasks).filter((task) => task.type === "build-structure")
      .length < 3
  ) {
    const buildStructureTask = createTask(
      definedTasks["build-structure"],
      {
        energyOriginId: energySource.id,
        roomController: controller.id,
      },
      TaskPriority.MEDIUM,
    );

    unfinishedTasks[buildStructureTask.id] = buildStructureTask;
  }

  if (
    !mySpawn.spawning &&
    mySpawn.room.energyAvailable >= 300 &&
    creeps.length < 5
  ) {
    spawnCreep(definedRoles.founder, mySpawn);
  }

  assignTasksToCreeps(unfinishedTasks, creeps);

  saveTasks(unfinishedTasks);

  if (Game.time % 100 === 0) {
    cleanMemory();
  }
}
