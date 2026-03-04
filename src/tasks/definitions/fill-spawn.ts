import { first } from "lodash-es";
import { defineTask } from "../defineTask";
import { hasNoValue } from "../../uitls";

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

    const room = spawn.room;
    const extensions = room
      .find(FIND_MY_STRUCTURES)
      .filter((structure) => structure.structureType === STRUCTURE_EXTENSION);

    const targets = [spawn, ...extensions].filter(
      (structure) => structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    );

    const targetStructure = first(targets);

    if (hasNoValue(targetStructure)) {
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (hasNoValue(creepMemory.harvesting)) {
      creepMemory.harvesting = true;
    } else if (creep.store.energy === 0) {
      creepMemory.harvesting = true;
    } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creepMemory.harvesting = false;
    }

    if (creepMemory.harvesting) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      if (
        creep.transfer(targetStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(targetStructure, {
          visualizePathStyle: { stroke: "#00aaff" },
        });
      }
    }
  },
  isFinished: ({ target }) => {
    const spawn = Game.getObjectById(target);

    if (!spawn) {
      console.log("[ERR][TASK:fill-spawn]: Invalid target");
      return true;
    }

    const room = spawn.room;

    return room.energyCapacityAvailable === room.energyAvailable;
  },
});
