import { describe, expect, it } from "vitest";
import { mockInstanceOf, mockGlobal } from "screeps-test-helper";
import { createTask, Task } from "./tasks/createTask";
import { TaskPriority } from "./tasks/priority";
import {
  calculateTaskAssignmentUpdates,
  TaskAssignmentUpdate,
} from "./taskScheduling";
import { hasValue, TypedId } from "./uitls";
import { sortBy } from "lodash-es";

describe("Task assignment", () => {
  mockGlobal<Game>("Game", { time: 1000 });

  function getUnassignedTaskPair({
    isAssignable = true,
    priority = TaskPriority.MEDIUM,
  }: {
    isAssignable?: boolean;
    priority?: TaskPriority;
  }): {
    creep: Creep;
    task: Task;
  } {
    const task = createTask(
      "fill-spawn",
      { targetRoom: "E1S1" as TypedId<Room> },
      priority,
    );

    if (isAssignable) {
      return {
        task,
        creep: mockInstanceOf<Creep>({
          memory: {
            role: "worker",
            assignedTask: null,
          },
        }),
      };
    } else {
      return {
        task,
        creep: mockInstanceOf<Creep>({
          memory: {
            role: "brute",
            assignedTask: null,
          },
        }),
      };
    }
  }

  function getAssignedTaskPair({
    priority = TaskPriority.MEDIUM,
  }: {
    priority?: TaskPriority;
  }): {
    creep: Creep;
    task: Task;
  } {
    const { task, creep } = getUnassignedTaskPair({
      isAssignable: true,
      priority: priority,
    });

    task.assigneeId = creep.name as TypedId<Creep>;
    creep.memory.assignedTask = task.id as TypedId<Task>;

    return { creep, task };
  }

  function sortTaskUpdates(
    updates: TaskAssignmentUpdate[],
  ): TaskAssignmentUpdate[] {
    return sortBy(updates, ([creep, task]) => {
      const creepName = hasValue(creep) ? creep.name : "";
      const taskId = hasValue(task) ? task.id : "";

      return `${creepName}-${taskId}`;
    });
  }

  it("does not assign tasks to creeps with incompatible roles", () => {
    const { creep, task } = getUnassignedTaskPair({
      isAssignable: false,
      priority: TaskPriority.MEDIUM,
    });

    const updates = calculateTaskAssignmentUpdates([creep], [task]);

    expect(updates).toEqual([[creep, null]]);
  });

  it("prefers assigning tasks to idle creeps", () => {
    const { creep: idleCreep, task: unassignedTask } = getUnassignedTaskPair({
      priority: TaskPriority.MEDIUM,
    });

    const { creep: busyCreep, task: assignedTask } = getAssignedTaskPair({
      priority: TaskPriority.MEDIUM,
    });

    const updates = calculateTaskAssignmentUpdates(
      [idleCreep, busyCreep],
      [assignedTask, unassignedTask],
    );

    const expected = [[idleCreep, unassignedTask]];

    expect(updates).toEqual(expected);
  });

  it("is able to assign tasks regardless of the order of creeps", () => {
    const { creep: idleCreep, task: unassignedTask } = getUnassignedTaskPair({
      priority: TaskPriority.MEDIUM,
    });

    const { creep: anotherIdleCreep, task: anotherUnassignedTask } =
      getUnassignedTaskPair({
        priority: TaskPriority.MEDIUM,
      });

    const updates1 = sortTaskUpdates(
      calculateTaskAssignmentUpdates(
        [idleCreep, anotherIdleCreep],
        [unassignedTask, anotherUnassignedTask],
      ),
    );

    const updates2 = sortTaskUpdates([
      [anotherIdleCreep, anotherUnassignedTask],
      [idleCreep, unassignedTask],
    ]);

    const expected = sortTaskUpdates([
      [anotherIdleCreep, anotherUnassignedTask],
      [idleCreep, unassignedTask],
    ]);

    expect(updates1).toEqual(expected);
    expect(updates2).toEqual(expected);
  });

  it("should be able to assign tasks regardless of the order of tasks", () => {
    const { creep: idleCreep, task: unassignedTask } = getUnassignedTaskPair({
      priority: TaskPriority.MEDIUM,
    });

    const { creep: anotherIdleCreep, task: anotherUnassignedTask } =
      getUnassignedTaskPair({
        priority: TaskPriority.MEDIUM,
      });

    const updates1 = sortTaskUpdates(
      calculateTaskAssignmentUpdates(
        [idleCreep, anotherIdleCreep],
        [anotherUnassignedTask, unassignedTask],
      ),
    );

    const updates2 = sortTaskUpdates([
      [idleCreep, unassignedTask],
      [anotherIdleCreep, anotherUnassignedTask],
    ]);

    const expected = sortTaskUpdates([
      [idleCreep, unassignedTask],
      [anotherIdleCreep, anotherUnassignedTask],
    ]);

    expect(updates1).toEqual(expected);
    expect(updates2).toEqual(expected);
  });

  it("should prefer assigning higher priority tasks", () => {
    const { creep: idleCreep, task: highPriorityTask } = getUnassignedTaskPair({
      priority: TaskPriority.HIGH,
    });

    const { task: lowPriorityTask } = getUnassignedTaskPair({
      priority: TaskPriority.LOW,
    });

    const updates = calculateTaskAssignmentUpdates(
      [idleCreep],
      [lowPriorityTask, highPriorityTask],
    );

    expect(updates[0]?.[0]).toBe(idleCreep);
    expect(updates[0]?.[1]).toBe(highPriorityTask);
  });
});
