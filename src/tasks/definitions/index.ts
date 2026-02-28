import { fillSpawnerTaskDefinition } from "./fillSpawner";

export const taskDefinitions = {
  fillSpawner: fillSpawnerTaskDefinition,
};

export type TaskDefinitionName = keyof typeof taskDefinitions;

export function isTaskDefinitionName(
  value: string,
): value is TaskDefinitionName {
  return value in taskDefinitions;
}
