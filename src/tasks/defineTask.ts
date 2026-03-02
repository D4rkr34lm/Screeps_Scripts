export interface TaskDefinition<
  TaskConstraints extends Record<string, unknown>,
  TaskState extends Record<string, unknown>,
> {
  name: string;
  maxAssignees: number;
  createStartState: () => TaskState;
  isFinished: (context: {
    constraints: TaskConstraints;
    state: TaskState;
  }) => boolean;
  execute: (context: {
    creep: Creep;
    room: Room;
    constraints: TaskConstraints;
    state: TaskState;
  }) => TaskState | undefined;
}

export function defineTask<
  TaskConstraints extends Record<string, unknown>,
  TaskState extends Record<string, unknown>,
>({
  name,
  maxAssignees,
  createStartState,
  execute,
  isFinished,
}: {
  name: string;
  maxAssignees: number;
  createStartState: () => TaskState;
  isFinished: (context: {
    constraints: TaskConstraints;
    state: TaskState;
  }) => boolean;
  execute: (context: {
    creep: Creep;
    room: Room;
    constraints: TaskConstraints;
    state: TaskState;
  }) => TaskState | undefined;
}): TaskDefinition<TaskConstraints, TaskState> {
  return { name, maxAssignees, execute, createStartState, isFinished };
}
