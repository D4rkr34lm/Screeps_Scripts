const _ = require("lodash");

import spawnerTick from "./spawnController";
import workerTick from "./gatherer";
import { RoleMemory } from "./creepMemory";

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
    delete Memory.creeps[cellId];
  }
}
