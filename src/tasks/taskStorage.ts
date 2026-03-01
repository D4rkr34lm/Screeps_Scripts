import { useStorage } from "../storage";
import { isTaskType, taskDefinitions } from "./definitions";
import { Task } from "./taskService";

export interface TaskRecord {
  id: string;
  typeName: string;
  constraints: unknown;
  state: unknown;
}

export interface TaskStorage {
  [taskId: string]: TaskRecord;
}

export function useTaskStorage() {
  const storage = useStorage();
  const taskStorageMap = storage.tasks ?? {};

  function saveTask(task: Task<any, any>): void {
    taskStorageMap[task.id] = {
      id: task.id,
      typeName: task.type.name,
      constraints: task.constraints,
      state: task.state,
    };
    storage.tasks = taskStorageMap;
  }

  function loadTask(taskId: string): Task<any, any> | null {
    const record = taskStorageMap[taskId];
    if (!record) {
      return null;
    }

    const taskType = record.typeName;

    if (isTaskType(taskType)) {
      const taskDefinition = taskDefinitions[taskType];
      return {
        ...record,
        type: taskDefinition,
      };
    } else {
      console.error(`Unknown task type: ${taskType}`);
      return null;
    }
  }

  return { saveTask, loadTask };
}
