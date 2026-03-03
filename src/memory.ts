import { toPairs } from "lodash-es";
import { Task } from "./tasks/createTask";
import { hasNoValue } from "./uitls";
import { TaskType } from "./tasks/definitions";

interface TaskMemory {
  [taskId: string]: {
    type: TaskType;
    parameters: Record<string, unknown>;
    assignedCreep: string | null;
  };
}

export function getTasks(): Task[] {
  const memory = Memory as { tasks?: TaskMemory };

  if (!memory.tasks) {
    memory.tasks = {};
  }

  return toPairs(memory.tasks).map(([taskId, taskData]) => ({
    id: taskId,
    type: taskData.type,
    parameters: taskData.parameters,
    assignedCreep: taskData.assignedCreep
      ? Game.creeps[taskData.assignedCreep] || null
      : null,
  }));
}

export function saveTasks(tasks: Task[]) {
  const memory = Memory as { tasks?: TaskMemory };

  if (!memory.tasks) {
    memory.tasks = {};
  }

  const taskMemory = memory.tasks;

  tasks.forEach((task) => {
    taskMemory[task.id] = {
      type: task.type,
      parameters: task.parameters,
      assignedCreep: task.assignedCreep ? task.assignedCreep.name : null,
    };
  });
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
