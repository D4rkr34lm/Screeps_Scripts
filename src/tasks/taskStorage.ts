import { values } from "lodash-es";
import { useStorage } from "../storage";
import { hasNoValue } from "../uitls";
import { isTaskType, taskDefinitions } from "./definitions";
import { Task } from "./taskService";

export interface TaskRecord {
  id: string;
  typeName: string;
  assigneeCount: number;
  constraints: unknown;
  state: unknown;
}

export interface TaskStorage {
  [taskId: string]: TaskRecord;
}

const taskMapper = {
  serialize(task: Task<any, any>): TaskRecord {
    return {
      id: task.id,
      assigneeCount: task.assigneeCount,
      typeName: task.type.name,
      constraints: task.constraints,
      state: task.state,
    };
  },

  deserialize(record: TaskRecord): Task<any, any> {
    const taskType = record.typeName;

    if (isTaskType(taskType)) {
      const taskDefinition = taskDefinitions[taskType];
      return {
        ...record,
        type: taskDefinition,
      };
    } else {
      throw new Error(`Unknown task type: ${taskType}`);
    }
  },
};

export function useTaskStorage() {
  const storage = useStorage();
  const taskStorageMap = storage.tasks ?? {};

  function saveTask(task: Task<any, any>): void {
    const record = taskMapper.serialize(task);

    taskStorageMap[task.id] = record;
    storage.tasks = taskStorageMap;
  }

  function loadTask(taskId: string): Task<any, any> {
    const record = taskStorageMap[taskId];

    if (hasNoValue(record)) {
      throw new Error(`Task with ID ${taskId} not found in storage.`);
    }

    const task = taskMapper.deserialize(record);
    return task;
  }

  function listTasks(): Task<any, any>[] {
    return values(taskStorageMap).map((record) =>
      taskMapper.deserialize(record),
    );
  }

  return { saveTask, loadTask, listTasks };
}
