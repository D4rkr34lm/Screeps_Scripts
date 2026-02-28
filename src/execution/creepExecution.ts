import { isString } from "lodash-es";
import { isDebug } from "../main";
import { isRoleName, Role, roleDefinitions } from "../roles";
import { hasValue } from "../uitls";
import { createTask } from "../tasks/createTask";

function deserializeCreep(creep: Creep): {
  creep: Creep;
  role: Role;
  memory: any;
  assignedTaskId: string | null;
} {
  const {
    role: roleName,
    roleMemory: memory,
    assignedTask: assignedTask,
  } = creep.memory as any;

  if (!isString(roleName) || !isRoleName(roleName)) {
    throw new Error(`Creep ${creep.name} has invalid role name ${roleName}`);
  } else {
    const role = roleDefinitions[roleName];

    return { creep, role, memory, assignedTaskId: assignedTask ?? null };
  }
}

export function executeCreeps(
  creeps: Creep[],
  availableTasks: { [taskId: string]: ReturnType<typeof createTask> },
): void {
  for (const creep of creeps) {
    if (creep.spawning || creep.ticksToLive === undefined) {
      continue;
    }

    const { role, memory, assignedTaskId } = deserializeCreep(creep);

    const newMemory = role.behavior({
      creep,
      room: creep.room,
      memory,
      task: availableTasks[assignedTaskId ?? ""],
    });

    if (isDebug) {
      console.log({
        creepName: creep.name,
        roleName: role.name,
        oldMemory: memory,
        newMemory,
      });
    }

    if (hasValue(newMemory)) {
      (creep.memory as any).roleMemory = newMemory;
    }
  }
}
