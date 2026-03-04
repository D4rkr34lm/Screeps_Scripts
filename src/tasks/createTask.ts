import { TaskDefinition } from "./defineTask";
import { TaskType } from "./definitions";

export type Task<
  Type extends TaskType = TaskType,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  type: Type;
  parameters: Parameters;
  assignedCreep: Creep | null;
};

export function createTask<
  Type extends TaskType,
  Parameters extends Record<string, unknown>,
>(
  taskDefinition: TaskDefinition<Type, Parameters>,
  parameters: Parameters,
): Task<Type, Parameters> {
  return {
    id: `${taskDefinition.name}-${Game.time}-${Math.random().toString(36)}`,
    type: taskDefinition.name,
    parameters,
    assignedCreep: null,
  };
}
