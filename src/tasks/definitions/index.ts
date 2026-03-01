import { fillSpawnerTaskDefinition } from "./fillSpawner";

export const taskDefinitions = {
  fillSpawner: fillSpawnerTaskDefinition,
} as const;

export type TaskType = keyof typeof taskDefinitions;

export function isTaskType(value: string): value is TaskType {
  return value in taskDefinitions;
}
