import { TypedId } from "../uitls";
import { TaskDefinition } from "./defineTask";
import { TaskType } from "./definitions";
import { TaskPriority } from "./priority";

export type Task<
  Type extends TaskType = TaskType,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  type: Type;
  parameters: Parameters;
  priority: TaskPriority;
  assigneeId: TypedId<Creep> | null;
};

export function createTask<
  Type extends TaskType,
  Parameters extends Record<string, unknown>,
>(
  taskDefinition: TaskDefinition<Type, Parameters>,
  parameters: Parameters,
  priority: TaskPriority,
): Task<Type, Parameters> {
  return {
    id: `${taskDefinition.name}-${Game.time}-${Math.random().toString(36)}`,
    type: taskDefinition.name,
    parameters,
    priority,
    assigneeId: null,
  };
}
