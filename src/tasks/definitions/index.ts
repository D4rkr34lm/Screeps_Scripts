import { TaskDefinition } from "../defineTask";
import { attackCreepsTaskDefinition } from "./attackCreeps";
import { buildStructureTaskDefinition } from "./build-structure";
import { fillSpawnTaskDefinition } from "./fill-spawn";
import { harvestResourceTaskDefinition } from "./harvest-resource";
import { repairStructuresTaskDefinition } from "./repair-structures";
import { upgradeControllerTaskDefinition } from "./upgrade-controller";

export const definedTasks = [
  fillSpawnTaskDefinition,
  upgradeControllerTaskDefinition,
  buildStructureTaskDefinition,
  repairStructuresTaskDefinition,
  harvestResourceTaskDefinition,
  attackCreepsTaskDefinition,
] as const;

export type DefinedTask = (typeof definedTasks)[number];

export type TaskType = DefinedTask["name"];

export type DefinedTaskMap = {
  [TaskName in DefinedTask["name"]]: Extract<DefinedTask, { name: TaskName }>;
};

export type TaskParameters<T extends TaskType> =
  Extract<DefinedTask, { name: T }> extends TaskDefinition<
    string,
    infer IParameters
  >
    ? IParameters
    : never;
