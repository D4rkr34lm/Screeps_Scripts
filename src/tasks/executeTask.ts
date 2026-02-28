import { hasValue } from "../uitls";
import { Task } from "./createTask";

export function executeTask<TaskConstraints, TaskState>(context: {
  creep: Creep;
  room: Room;
  task: Task<TaskConstraints, TaskState>;
}): void {
  const { creep, room, task } = context;
  if (
    task.type.isFinished({
      creep,
      room,
      constraints: task.constraints,
      state: task.state,
    })
  ) {
    return;
  }

  const newState = task.type.execute({
    creep,
    room,
    constraints: task.constraints,
    state: task.state,
  });

  if (hasValue(newState)) {
    task.state = newState;
  }
}
