import { isEmpty } from "lodash-es";
import { hasNoValue, TypedId } from "../../uitls";
import { defineTask } from "../defineTask";
import { getEnergy } from "../../actions/getEnergy";

export const buildStructureTaskDefinition = defineTask<
  "build-structure",
  { room: TypedId<Room> }
>({
  name: "build-structure",
  execute: ({ creep }) => {
    const target = creep.room.find(FIND_CONSTRUCTION_SITES)[0];

    if (hasNoValue(target)) {
      console.log("[ERR][TASK:build-structure]: Invalid target");
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creepMemory.harvesting = false;
    }

    if (creepMemory.harvesting || creep.store[RESOURCE_ENERGY] === 0) {
      getEnergy(creep);
    } else {
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {
          visualizePathStyle: { stroke: "#ffaa00" },
        });
      }
    }
  },
  isFinished: ({ roomController }) => {
    const controller = Game.getObjectById(roomController);

    if (hasNoValue(controller)) {
      console.log("[ERR][TASK:build-structure]: Invalid room controller");
      return true;
    }

    const constructionSides = controller.room.find(FIND_CONSTRUCTION_SITES);

    return isEmpty(constructionSides);
  },
});
