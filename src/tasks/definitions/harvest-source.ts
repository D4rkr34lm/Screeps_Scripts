import { defineTask } from "../defineTask";

export const harvestSourceTaskDefinition = defineTask<
  "harvest-source",
  { source: Id<Source>; harvestPosition: RoomPosition }
>({
  name: "harvest-source",
  execute: ({ creep, source, harvestPosition }) => {
    const sourceObject = Game.getObjectById(source);

    console.log("DEV");

    if (!sourceObject) {
      console.log("[ERR][TASK:harvest-source]: Invalid source");
      return;
    }

    if (
      creep.pos.x === harvestPosition.x &&
      creep.pos.y === harvestPosition.y
    ) {
      creep.harvest(sourceObject);
    } else {
      creep.moveTo(harvestPosition.x, harvestPosition.y, {
        visualizePathStyle: { stroke: "#ffaa00" },
      });
    }
  },
});
