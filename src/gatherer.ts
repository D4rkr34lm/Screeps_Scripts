import { WorkerRole } from "./creepMemory";

const _ = require("lodash");

function tick(creep: Creep): void {
  const store = creep.memory as WorkerRole;
  const room = creep.room;

  if (creep.store.getUsedCapacity() === 0) {
    store.gathering = true;
  } else if (creep.store.getFreeCapacity() === 0) {
    store.gathering = false;
  }

  if (store.gathering) {
    const sources = room.find(FIND_SOURCES_ACTIVE);
    const source = sources[0];
    const gatherResult = creep.harvest(source);

    if (gatherResult === ERR_NOT_IN_RANGE) {
      const path = room.findPath(creep.pos, source.pos);
      creep.moveByPath(path);
    }
  } else {
    const spawns = room.find(FIND_MY_SPAWNS);
    const fillableSpawns = spawns.filter((spawn) => spawn.store.getFreeCapacity() !== 0);

    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);

    if (!_.isEmpty(fillableSpawns)) {
      const target = fillableSpawns[0];
      const transferResult = creep.transfer(target, RESOURCE_ENERGY);

      if (transferResult === ERR_NOT_IN_RANGE) {
        const path = room.findPath(creep.pos, target.pos);
        creep.moveByPath(path);
      }
    } else if (!_.isEmpty(constructionSites)) {
      const target = constructionSites[0];
      const buildingResult = creep.build(target);

      if (buildingResult === ERR_NOT_IN_RANGE) {
        const path = room.findPath(creep.pos, target.pos);
        creep.moveByPath(path);
      }
    } else {
      const controller = room.controller;
      const upgradeResult = creep.upgradeController(controller);

      if (upgradeResult === ERR_NOT_IN_RANGE) {
        const path = room.findPath(creep.pos, controller.pos);
        creep.moveByPath(path);
      }
    }
  }
}

export default tick;
