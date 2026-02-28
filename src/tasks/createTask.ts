import { TaskDefinition } from "./defineTask";

export interface Task<TaskConstraints, TaskState> {
  type: TaskDefinition<TaskConstraints, TaskState>;
  id: string;
  constraints: TaskConstraints;
  state: TaskState;
}

export function createTask<TaskConstraints, TaskState>(
  type: TaskDefinition<TaskConstraints, TaskState>,
  constraints: TaskConstraints,
): Task<TaskConstraints, TaskState> {
  return {
    type,
    id: `${type.name}-${Game.time}`,
    constraints,
    state: type.createStartState(),
  };
}
