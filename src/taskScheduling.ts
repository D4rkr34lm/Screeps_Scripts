import { includes } from "lodash-es";
import { definedRoles } from "./roles/definitions";
import { Task } from "./tasks/createTask";
import { hasValue, shiftFromIf } from "./uitls";

type TaskAssignmentUpdate = [null, Task] | [Creep, Task] | [Creep, null];

export function calculateTaskAssignmentUpdates(
  creeps: Creep[],
  tasks: Task[],
): TaskAssignmentUpdate[] {
  const idleCreeps = creeps.filter(
    (creep) => creep.memory.assignedTask === null,
  );
  const unassignedTasks = tasks.filter((task) => task.assigneeId === null);

  return idleCreeps.map((creep) => {
    const taskToAssign = shiftFromIf(unassignedTasks, (task) => {
      const creepRole = definedRoles[creep.memory.role];

      return includes(creepRole.assignableTaskTypes, task.type);
    });

    if (hasValue(taskToAssign)) {
      return [creep, taskToAssign];
    } else {
      return [creep, null];
    }
  });
}
