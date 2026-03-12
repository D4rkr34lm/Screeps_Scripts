import { first } from "lodash-es";
import { defineTask } from "../defineTask";
import { hasNoValue, TypedId } from "../../uitls";
import { getEnergy } from "../../actions/getEnergy";
import { Resolver } from "../../resolver";

export const fillSpawnTaskDefinition = defineTask<
  "fill-spawn",
  { targetRoom: TypedId<Room> }
>({
  name: "fill-spawn",
  execute: ({ targetRoom, creep }) => {
    const room = Resolver.getRoom(targetRoom);

    const spawns = room.find(FIND_MY_SPAWNS);
    const extensions = room
      .find(FIND_MY_STRUCTURES)
      .filter((structure) => structure.structureType === STRUCTURE_EXTENSION);

    const targets = [...spawns, ...extensions].filter(
      (structure) => structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    );

    const targetStructure = first(targets);

    if (hasNoValue(targetStructure)) {
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creepMemory.harvesting = false;
    }

    if (creepMemory.harvesting || creep.store[RESOURCE_ENERGY] === 0) {
      getEnergy(creep);
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
  isFinished: ({ targetRoom }) => {
    const room = Resolver.getRoom(targetRoom);

    return room.energyCapacityAvailable === room.energyAvailable;
  },
});
