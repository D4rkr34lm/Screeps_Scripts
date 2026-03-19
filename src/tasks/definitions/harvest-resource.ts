import { deserializePosition, SerializedPosition } from "../../position";
import { hasNoValue } from "../../uitls";
import { defineTask } from "../defineTask";

export const harvestResourceTaskDefinition = defineTask<
  "harvest-resource",
  {
    resourceId: Id<Source> | Id<Deposit> | Id<Mineral>;
    outputContainerId: Id<StructureContainer> | Id<StructureLink>;
    harvestingPosition: SerializedPosition;
  }
>({
  name: "harvest-resource",
  execute: ({ creep, resourceId, outputContainerId, harvestingPosition }) => {
    const resource = Game.getObjectById(resourceId);
    const outputContainer = Game.getObjectById(outputContainerId);

    if (hasNoValue(resource) || hasNoValue(outputContainer)) {
      console.log(
        "[ERR][TASK:harvest-resource]: Invalid resource or output container",
      );
      return;
    }

    const harvestingResult = creep.harvest(resource);

    if (harvestingResult === OK) {
      if (creep.store.getFreeCapacity() === 0) {
        creep.transfer(outputContainer, RESOURCE_ENERGY);
      }
    } else if (harvestingResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(deserializePosition(harvestingPosition));
    }
  },
});
