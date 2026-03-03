import { values } from "lodash-es";
import { cleanMemory, getTasks, saveTasks } from "./memory";
import { Role } from "./roles/defineRole";
import { definedRoles } from "./roles/definitions";
import { createTask } from "./tasks/createTask";
import { definedTasks } from "./tasks/definitions";
import { hasNoValue, hasValue } from "./uitls";

function spawnCreep(role: Role, spawn: StructureSpawn) {
  spawn.spawnCreep(
    role.bodyComposition.baseParts,
    `${role.name}-${Game.time}`,
    {
      memory: {
        role: role.name,
        assignedTask: null,
      },
    },
  );
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

  if (!tasks.some((task) => task.type === "fill-spawn")) {
    const newTask = createTask(definedTasks["fill-spawn"], {
      target: mySpawn.id,
      energyOrigin: energySource.id,
    });

    tasks.push(newTask);
  } else if (tasks.length < 5) {
    const newTask = createTask(definedTasks["upgrade-controller"], {
      target: controller.id,
      energyOrigin: energySource.id,
    });

    tasks.push(newTask);
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
