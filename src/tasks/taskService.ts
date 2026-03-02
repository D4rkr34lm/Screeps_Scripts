import { Agent } from "../agents/agentService";
import { useAgentStorage } from "../agents/agentStorage";
import { TaskDefinition } from "./defineTask";
import { useTaskStorage } from "./taskStorage";

export interface Task<
  TaskConstraints extends Record<string, unknown>,
  TaskState extends Record<string, unknown>,
> {
  type: TaskDefinition<TaskConstraints, TaskState>;
  id: string;
  assigneeCount: number;
  constraints: TaskConstraints;
  state: TaskState;
}

export function useTaskService() {
  function createTask<
    TaskConstraints extends Record<string, unknown>,
    TaskState extends Record<string, unknown>,
  >(
    type: TaskDefinition<TaskConstraints, TaskState>,
    constraints: TaskConstraints,
  ): Task<TaskConstraints, TaskState> {
    const taskStorage = useTaskStorage();

    const newTask = {
      type,
      id: `${type.name}-${Game.time}`,
      assigneeCount: 0,
      constraints,
      state: type.createStartState(),
    };

    taskStorage.saveTask(newTask);

    return newTask;
  }

  function assignTask(task: Task<any, any>, agent: Agent<any>): void {
    const taskStorage = useTaskStorage();
    const agentStorage = useAgentStorage();

    if (task.assigneeCount >= task.type.maxAssignees) {
      throw new Error(
        `Task ${task.id} has already reached its maximum number of assignees.`,
      );
    }

    agent.memory.currentTaskId = task.id;

    agentStorage.saveAgent(agent);
    taskStorage.saveTask({ ...task, assigneeCount: task.assigneeCount + 1 });
  }

  function getOpenTasks(): Task<any, any>[] {
    const taskStorage = useTaskStorage();
    const allTasks = taskStorage.listTasks();

    return allTasks.filter(
      (task) =>
        !task.type.isFinished({
          state: task.state,
          constraints: task.constraints,
        }) && task.assigneeCount < task.type.maxAssignees,
    );
  }

  return { createTask, getOpenTasks, assignTask };
}
