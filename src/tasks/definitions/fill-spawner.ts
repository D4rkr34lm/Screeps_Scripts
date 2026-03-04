import { defineTask } from "../defineTask";

export const fillSpawnTaskDefinition = defineTask<
  "fill-spawn",
  { target: Id<StructureSpawn>; energyOrigin: Id<Source> }
>({
  name: "fill-spawn",
  execute: ({ target, energyOrigin, creep }) => {
    const spawn = Game.getObjectById(target);
    const source = Game.getObjectById(energyOrigin);

    if (!spawn || !source) {
      console.log("[ERR][TASK:fill-spawn]: Invalid target or energy origin");
      return;
    }

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn, { visualizePathStyle: { stroke: "#00aaff" } });
      }
    }
  },
  isFinished: ({ target }) => {
    const spawn = Game.getObjectById(target);

    if (!spawn) {
      console.log("[ERR][TASK:fill-spawn]: Invalid target");
      return true;
    }

    return spawn.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
  },
});
