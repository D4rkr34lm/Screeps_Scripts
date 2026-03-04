import { values } from "lodash-es";
import { cleanMemory, getTasks, saveTasks } from "./memory";
import { Role } from "./roles/defineRole";
import { definedRoles } from "./roles/definitions";
import { createTask } from "./tasks/createTask";
import { definedTasks } from "./tasks/definitions";
import { hasNoValue, hasValue } from "./uitls";
import { getMaximalScaledBodyParts } from "./roles/bodyComposition";

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

export function init() {
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
    createTask(definedTasks["fill-spawn"], {
      target: mySpawn.id,
      energyOrigin: energySource.id,
    }),
    createTask(definedTasks["upgrade-controller"], {
      target: controller.id,
      energyOrigin: energySource.id,
    }),
    createTask(definedTasks["upgrade-controller"], {
      target: controller.id,
      energyOrigin: energySource.id,
    }),
    createTask(definedTasks["build-structure"], {
      energyOriginId: energySource.id,
    }),
    createTask(definedTasks["build-structure"], {
      energyOriginId: energySource.id,
    }),
  ];

  saveTasks(startTasks);
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

  const tasks = getTasks();
  const creeps = values(Game.creeps);

  const remainingTasks = tasks.filter((task) => {
    const definition = definedTasks[task.type];

    if (definition.isFinished?.(task.parameters as any)) {
      if (hasValue(task.assignedCreep)) {
        const creepMemory = task.assignedCreep.memory as {
          role: string;
          assignedTask: string | null;
        };
        creepMemory.assignedTask = null;
      }

      console.log(
        `[INFO][TASK:${task.type}]: Task finished and removed from memory`,
      );

      return false;
    } else {
      return true;
    }
  });

  remainingTasks.forEach((task) => {
    if (task.assignedCreep) {
      const definition = definedTasks[task.type];

      definition.execute({
        creep: task.assignedCreep,
        ...(task.parameters as any),
      });
    }
  });

  if (
    !remainingTasks.some((task) => task.type === "fill-spawn") &&
    mySpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  ) {
    remainingTasks.push(
      createTask(definedTasks["fill-spawn"], {
        target: mySpawn.id,
        energyOrigin: energySource.id,
      }),
    );
  }

  if (
    !mySpawn.spawning &&
    mySpawn.room.energyAvailable >= 300 &&
    creeps.length < 5
  ) {
    spawnCreep(definedRoles.founder, mySpawn);
  }

  creeps.forEach((creep) => {
    const creepMemory = creep.memory as {
      role: string;
      assignedTask: string | null;
    };

    if (hasValue(creepMemory.assignedTask)) {
      return;
    }

    const availableTask = remainingTasks.find(
      (task) => task.assignedCreep === null,
    );

    if (availableTask) {
      availableTask.assignedCreep = creep;
      creepMemory.assignedTask = availableTask.id;
    }
  });

  saveTasks(remainingTasks);

  if (Game.time % 100 === 0) {
    cleanMemory();
  }
}
