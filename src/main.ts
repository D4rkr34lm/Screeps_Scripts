const _ = require("lodash");

import workerTick from "./gatherer";
import spawnerTick from "./spawnController";

import { BasicCreepMemory, RoleMemory } from "./creepMemory";
import { SpawnerMemory } from "./spawnController";
import { hasValue } from "./utils";

export function loop() {
  const behaviors = {
    worker: workerTick,
  };

  _.forEach(Game.creeps, (creep, id) => {
    const store = creep.memory as RoleMemory;
    const behavior = behaviors[store.role];
    behavior(creep);
  });

  _.forEach(Game.spawns, (spawner, id) => {
    spawnerTick(spawner);
  });

  cleanMemory();
}

function cleanMemory() {
  const activCreepIds = _.keys(Game.creeps);
  const creepMemoryKeys = _.keys(Memory.creeps);

  const inactivMemoryCellIds = _.difference(creepMemoryKeys, activCreepIds);

  for (const cellId of inactivMemoryCellIds) {
    const deadMemory = Memory.creeps[cellId] as BasicCreepMemory;
    if (hasValue(deadMemory.spawnedBy)) {
      const spawnMemory = Game.spawns[deadMemory.spawnedBy].memory as SpawnerMemory;

      spawnMemory.currentPerRole[deadMemory.role]--;
    }
    delete Memory.creeps[cellId];
  }
}
