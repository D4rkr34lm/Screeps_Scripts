import { fromPairs, toPairs, values } from "lodash-es";
import { Task } from "./tasks/createTask";
import { hasNoValue } from "./uitls";
import { TaskType } from "./tasks/definitions";

interface TaskMemory {
  [taskId: string]: {
    type: TaskType;
    parameters: Record<string, unknown>;
    assignedCreep: string | null;
    priority: number;
  };
}

export function getTasks(): { [taskId: string]: Task } {
  const memory = Memory as { tasks?: TaskMemory };

  if (!memory.tasks) {
    memory.tasks = {};
  }

  return fromPairs(
    toPairs(memory.tasks).map(
      ([taskId, taskData]) =>
        [
          taskId,
          {
            id: taskId,
            type: taskData.type,
            parameters: taskData.parameters,
            assignedCreep: taskData.assignedCreep
              ? Game.creeps[taskData.assignedCreep] || null
              : null,
            priority: taskData.priority,
          },
        ] as [string, Task],
    ),
  );
}

export function saveTasks(tasks: { [taskId: string]: Task }) {
  const memory = Memory as { tasks?: TaskMemory };

  if (!memory.tasks) {
    memory.tasks = {};
  }

  const newMemory: TaskMemory = {};

  values(tasks).forEach((task) => {
    newMemory[task.id] = {
      type: task.type,
      parameters: task.parameters,
      assignedCreep: task.assignedCreep ? task.assignedCreep.name : null,
      priority: task.priority,
    };
  });

  memory.tasks = newMemory;
}

interface CreepMemory {
  role: string;
  assignedTask: string | null;
}

export function getCreepMemory(creep: Creep): CreepMemory {
  return creep.memory as CreepMemory;
}

export function cleanMemory() {
  const memory = Memory as { tasks?: TaskMemory };

  if (hasNoValue(memory.tasks)) {
    memory.tasks = {};
  }

  const taskMemory = memory.tasks;

  toPairs(taskMemory).forEach(([taskId, task]) => {
    if (task.assignedCreep) {
      const creep = Game.creeps[task.assignedCreep];
      if (!creep) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete taskMemory[taskId];
      }
    }
  });

  toPairs(Memory.creeps).forEach(([creepName]) => {
    if (hasNoValue(Game.creeps[creepName])) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete Memory.creeps[creepName];
    }
  });
}
