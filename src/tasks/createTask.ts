import { uid } from "uid";
import { TypedId } from "../uitls";
import { TaskParameters, TaskType } from "./definitions";
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
  const TType extends TaskType,
  TParameters extends TaskParameters<TType> = TaskParameters<TType>,
>(
  taskType: TType,
  parameters: TParameters,
  priority: TaskPriority,
): Task<TType, TParameters> {
  return {
    id: `${taskType}-${Game.time}-${uid()}`,
    type: taskType,
    parameters,
    priority,
    assigneeId: null,
  };
}
