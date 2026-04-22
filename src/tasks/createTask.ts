import { uid } from "uid";
import { TaskParameters, TaskType } from "./definitions";
import { TaskPriority } from "./priority";
import { Ref } from "../resolver";

export type Task<
  Type extends TaskType = TaskType,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  type: Type;
  parameters: Parameters;
  priority: TaskPriority;
  assigneeId: Ref<Creep> | null;
};

/**
 * Create a new task to be added to the colony's task list.
 * The task will be assigned an id and will be unassigned by default.
 */
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
