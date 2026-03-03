import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";

export const upgradeControllerTaskDefinition = defineTask<
  "upgrade-controller",
  { target: Id<StructureController>; energyOrigin: Id<Source> }
>({
  name: "upgrade-controller",
  execute: ({ creep, target, energyOrigin }) => {
    const controller = Game.getObjectById(target);
    const source = Game.getObjectById(energyOrigin);

    if (hasNoValue(controller) || hasNoValue(source)) {
      console.log(
        "[ERR][TASK:upgrade-controller]: Invalid target or energy origin",
      );
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (hasNoValue(creepMemory.harvesting)) {
      creepMemory.harvesting = true;
    }

    if (creepMemory.harvesting) {
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      } else {
        creepMemory.harvesting = false;
      }
    } else {
      if (creep.store.energy === 0) {
        creepMemory.harvesting = true;
        return;
      }

      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, { visualizePathStyle: { stroke: "#00aaff" } });
      }
    }
  },
});
