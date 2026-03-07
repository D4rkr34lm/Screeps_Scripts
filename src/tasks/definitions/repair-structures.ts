import { isEmpty } from "lodash-es";
import { ACCEPTABLE_HITS_LOSS } from "../../constants";
import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";
import { getEnergy } from "../../actions/getEnergy";

export const repairStructuresTaskDefinition = defineTask<
  "repair-structures",
  { energyOrigin: Id<Source>; roomController: Id<StructureController> }
>({
  name: "repair-structures",
  execute: ({ creep, energyOrigin }) => {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax,
    });

    const source = Game.getObjectById(energyOrigin);

    if (!source || !target) {
      console.log(
        "[ERR][TASK:repair-structures]: Invalid energy origin or no structures to repair",
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
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
  isFinished: ({ roomController }) => {
    const controller = Game.getObjectById(roomController);

    if (hasNoValue(controller)) {
      console.log("[ERR][TASK:repair-structures]: Invalid room controller");
      return true;
    }

    const room = controller.room;

    const damagedStructures = room
      .find(FIND_STRUCTURES)
      .filter(
        (structure) =>
          structure.hits < structure.hitsMax - ACCEPTABLE_HITS_LOSS,
      );

    return isEmpty(damagedStructures);
  },
});
