import { ACCEPTABLE_HITS_LOSS } from "../../constants";
import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";
import { getEnergy } from "../../actions/getEnergy";
import { EnergyOrigin } from "../../transportation";

export const repairStructuresTaskDefinition = defineTask<
  "repair-structures",
  { energyOriginId: Id<EnergyOrigin>; targetId: Id<Structure> }
>({
  name: "repair-structures",
  execute: ({ creep, energyOriginId, targetId }) => {
    const energyOrigin = Game.getObjectById(energyOriginId);

    if (hasNoValue(energyOrigin)) {
      console.log("[ERR][TASK:repair-structures]: Invalid energy origin");
      return;
    }

    if (creep.store.getUsedCapacity() === 0) {
      getEnergy(creep, energyOrigin);
    } else {
      const target = Game.getObjectById(targetId);

      if (hasNoValue(target)) {
        console.log("[ERR][TASK:repair-structures]: Invalid target");
        return;
      }

      creep.repair(target);
    }
  },
  isFinished: ({ targetId }) => {
    const target = Game.getObjectById(targetId);

    return (
      hasNoValue(target) || target.hits <= target.hitsMax - ACCEPTABLE_HITS_LOSS
    );
  },
});
