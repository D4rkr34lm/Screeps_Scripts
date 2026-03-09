import { getEnergy } from "../../actions/getEnergy";
import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";

export const upgradeControllerTaskDefinition = defineTask<
  "upgrade-controller",
  { target: Id<StructureController>; targetLevel: number }
>({
  name: "upgrade-controller",
  execute: ({ creep, target }) => {
    const controller = Game.getObjectById(target);

    if (hasNoValue(controller)) {
      console.log(
        "[ERR][TASK:upgrade-controller]: Invalid target or energy origin",
      );
      return;
    }

    const creepMemory = creep.memory as { harvesting?: boolean };

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creepMemory.harvesting = false;
    }

    if (creepMemory.harvesting || creep.store[RESOURCE_ENERGY] === 0) {
      getEnergy(creep);
    } else {
      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, { visualizePathStyle: { stroke: "#00aaff" } });
      }
    }
  },
  isFinished: ({ target, targetLevel }) => {
    const controller = Game.getObjectById(target);

    if (hasNoValue(controller)) {
      console.log(
        "[ERR][TASK:upgrade-controller]: Invalid target or energy origin",
      );
      return true;
    }

    return controller.level >= targetLevel;
  },
});
