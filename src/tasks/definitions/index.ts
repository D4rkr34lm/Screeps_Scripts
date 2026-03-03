import { fillSpawnTaskDefinition } from "./fill-spawner";
import { upgradeControllerTaskDefinition } from "./upgrade-controller";

export const definedTasks = {
  "fill-spawn": fillSpawnTaskDefinition,
  "upgrade-controller": upgradeControllerTaskDefinition,
};

export type TaskType = keyof typeof definedTasks;
