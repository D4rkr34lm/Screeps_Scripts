import _ = require("lodash");

import workerTick from "./behaviors/gatherer";
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
}
