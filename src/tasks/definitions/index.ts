import { fillSpawnTaskDefinition } from "./fill-spawner";

export const definedTasks = {
  "fill-spawn": fillSpawnTaskDefinition,
};

export type TaskType = keyof typeof definedTasks;
