import { TaskDefinition } from "./defineTask";
import { useTaskStorage } from "./taskStorage";

export interface Task<TaskConstraints, TaskState> {
  type: TaskDefinition<TaskConstraints, TaskState>;
  id: string;
  constraints: TaskConstraints;
  state: TaskState;
}

export function useTaskService() {
  function createTask<TaskConstraints, TaskState>(
    type: TaskDefinition<TaskConstraints, TaskState>,
    constraints: TaskConstraints,
  ): Task<TaskConstraints, TaskState> {
    const taskStorage = useTaskStorage();

    const newTask = {
      type,
      id: `${type.name}-${Game.time}`,
      constraints,
      state: type.createStartState(),
    };

    taskStorage.saveTask(newTask);

    return newTask;
  }

  return { createTask };
}
