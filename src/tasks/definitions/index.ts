import { buildStructureTaskDefinition } from "./build-structure";
import { fillSpawnTaskDefinition } from "./fill-spawn";
import { repairStructuresTaskDefinition } from "./repair-structures";
import { upgradeControllerTaskDefinition } from "./upgrade-controller";

export const definedTasks = {
  "fill-spawn": fillSpawnTaskDefinition,
  "upgrade-controller": upgradeControllerTaskDefinition,
  "build-structure": buildStructureTaskDefinition,
  "repair-structures": repairStructuresTaskDefinition,
};

export type TaskType = keyof typeof definedTasks;
