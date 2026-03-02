import { fillSpawnerTaskDefinition } from "./fillSpawner";

export const taskDefinitions = {
  "fill-spawner": fillSpawnerTaskDefinition,
} as const;

export type TaskType = keyof typeof taskDefinitions;

export function isTaskType(value: string): value is TaskType {
  return value in taskDefinitions;
}
