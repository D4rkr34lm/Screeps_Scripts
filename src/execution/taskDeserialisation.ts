import { mapValues } from "lodash-es";
import { isTaskDefinitionName, taskDefinitions } from "../tasks/definitions";

export interface TaskRecord {
  id: string;
  typeName: string;
  constraints: any;
  state: any;
}

export function deserializeTasks() {
  const serializedTasks = (Memory as any).tasks as
    | { [taskId: string]: TaskRecord }
    | undefined;

  if (!serializedTasks) {
    return {};
  } else {
    return mapValues(serializedTasks, (taskRecord) => {
      if (!isTaskDefinitionName(taskRecord.typeName)) {
        throw new Error(`Unknown task type: ${taskRecord.typeName}`);
      }

      const taskType = taskDefinitions[taskRecord.typeName];
      return {
        id: taskRecord.id,
        type: taskType,
        constraints: taskRecord.constraints,
        state: taskRecord.state,
      };
    });
  }
}
