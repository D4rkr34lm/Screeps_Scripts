import { first, isEmpty } from "lodash-es";
import { defineTask } from "../defineTask";

export const attackCreepsTaskDefinition = defineTask<
  "attack-creeps",
  { controllerId: Id<StructureController> }
>({
  name: "attack-creeps",
  execute: ({ creep }) => {
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

    const enemy = first(hostiles);

    if (enemy) {
      if (creep.attack(enemy) === ERR_NOT_IN_RANGE) {
        creep.moveTo(enemy, { visualizePathStyle: { stroke: "#ff0000" } });
      }
    }
  },
  isFinished: ({ controllerId }) => {
    const controller = Game.getObjectById(controllerId);

    if (!controller) {
      return true;
    }

    const hostiles = controller.room.find(FIND_HOSTILE_CREEPS);
    return isEmpty(hostiles);
  },
});
