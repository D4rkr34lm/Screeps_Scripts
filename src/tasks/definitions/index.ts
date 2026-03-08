import { attackCreepsTaskDefinition } from "./attackCreeps";
import { buildStructureTaskDefinition } from "./build-structure";
import { fillSpawnTaskDefinition } from "./fill-spawn";
import { harvestSourceTaskDefinition } from "./harvest-source";
import { repairStructuresTaskDefinition } from "./repair-structures";
import { upgradeControllerTaskDefinition } from "./upgrade-controller";

export const definedTasks = {
  "fill-spawn": fillSpawnTaskDefinition,
  "upgrade-controller": upgradeControllerTaskDefinition,
  "build-structure": buildStructureTaskDefinition,
  "repair-structures": repairStructuresTaskDefinition,
  "harvest-source": harvestSourceTaskDefinition,
  "attack-creeps": attackCreepsTaskDefinition,
};

export type TaskType = keyof typeof definedTasks;
