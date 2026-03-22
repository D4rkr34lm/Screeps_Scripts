import { toPairs } from "lodash-es";
import { hasNoValue } from "./uitls";
import { TaskType } from "./tasks/definitions";
import { RoleName } from "./roles/definitions";

interface TaskMemory {
  [taskId: string]: {
    type: TaskType;
    parameters: Record<string, unknown>;
    assignedCreep: string | null;
    priority: number;
  };
}

interface CreepMemory {
  role: RoleName;
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
