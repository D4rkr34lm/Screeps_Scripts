export interface TaskDefinition<TaskConstraints, TaskState> {
  name: string;
  createStartState: () => TaskState;
  isFinished: (context: {
    creep: Creep;
    room: Room;
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

export function defineTask<TaskConstraints, TaskState>({
  name,
  createStartState,
  execute,
  isFinished,
}: {
  name: string;
  createStartState: () => TaskState;
  isFinished: (context: {
    creep: Creep;
    room: Room;
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
  return { name, execute, createStartState, isFinished };
}
