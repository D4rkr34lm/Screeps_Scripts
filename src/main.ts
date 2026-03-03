import { values } from "lodash-es";
import { cleanMemory, getTasks, saveTasks } from "./memory";
import { Role } from "./roles/defineRole";
import { definedRoles } from "./roles/definitions";
import { createTask } from "./tasks/createTask";
import { definedTasks } from "./tasks/definitions";
import { hasNoValue, hasValue } from "./uitls";
import {
  getMaximalCompositionFactor,
  getScaledBodyParts,
} from "./roles/bodyComposition";

function spawnCreep(role: Role, spawn: StructureSpawn) {
  const availableEnergy = spawn.room.energyAvailable;

  const scalingFactor = getMaximalCompositionFactor(
    role.bodyComposition,
    availableEnergy,
  );

  const bodyPartsResult = getScaledBodyParts(
    role.bodyComposition,
    scalingFactor,
  );

  if (bodyPartsResult.isOk()) {
    spawn.spawnCreep(
      bodyPartsResult.value,
      `${role.name}-${Math.random().toString(36)}`,
      {
        memory: {
          role: role.name,
          assignedTask: null,
        },
      },
    );
  }
}

export function loop() {
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

  tasks.forEach((task) => {
    if (task.assignedCreep) {
      const definition = definedTasks[task.type];

      definition.execute({
        creep: task.assignedCreep,
        ...(task.parameters as any),
      });
    }
  });

  if (
    !mySpawn.spawning &&
    mySpawn.room.energyAvailable >= 300 &&
    creeps.length < 5
  ) {
    spawnCreep(definedRoles.founder, mySpawn);
  }

  if (tasks.length === 0) {
    const taskSet = [
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

    tasks.push(...taskSet);
  }

  creeps.forEach((creep) => {
    const creepMemory = creep.memory as {
      role: string;
      assignedTask: string | null;
    };

    if (hasValue(creepMemory.assignedTask)) {
      return;
    }

    const availableTask = tasks.find((task) => task.assignedCreep === null);

    if (availableTask) {
      availableTask.assignedCreep = creep;
      creepMemory.assignedTask = availableTask.id;
    }
  });

  saveTasks(tasks);

  if (Game.time % 100 === 0) {
    cleanMemory();
  }
}
