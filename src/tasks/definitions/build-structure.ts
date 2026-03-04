import { isEmpty } from "lodash-es";
import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";

export const buildStructureTaskDefinition = defineTask<
  "build-structure",
  { energyOriginId: Id<Source>; roomController: Id<StructureController> }
>({
  name: "build-structure",
  execute: ({ creep, energyOriginId }) => {
    const target = creep.room.find(FIND_CONSTRUCTION_SITES)[0];
    const energyOrigin = Game.getObjectById(energyOriginId);

    if (hasNoValue(target) || hasNoValue(energyOrigin)) {
      console.log(
        "[ERR][TASK:build-structure]: Invalid target or energy origin",
      );
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (hasNoValue(creepMemory.harvesting)) {
      creepMemory.harvesting = true;
    }
    if (creepMemory.harvesting) {
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.harvest(energyOrigin) === ERR_NOT_IN_RANGE) {
          creep.moveTo(energyOrigin, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      } else {
        creepMemory.harvesting = false;
      }
    } else {
      if (creep.store.energy === 0) {
        creepMemory.harvesting = true;
        return;
      }
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#00aaff" } });
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
