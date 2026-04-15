import { describe, expect, it } from "vitest";
import { mockInstanceOf, mockGlobal } from "screeps-test-helper";
import { createTask, Task } from "./tasks/createTask";
import { TaskPriority } from "./tasks/priority";
import { defineTask } from "./tasks/defineTask";
import {
  calculateTaskAssignmentUpdates,
  TaskAssignmentUpdate,
} from "./taskScheduling";
import { definedTasks } from "./tasks/definitions";
import { hasValue, TypedId } from "./uitls";
import { sortBy } from "lodash-es";

const incompatibleTaskDefinition = defineTask({
  name: "incompatible",
  execute: () => {},
  isFinished: () => false,
});

describe("calculateTaskAssignmentUpdates", () => {
  mockGlobal<Game>("Game", { time: 1000 });

  it("should not assign tasks to creeps with incompatible roles", () => {
    const mockCreep = mockInstanceOf<Creep>({
      memory: {
        role: "brute",
        assignedTask: null,
      },
    });

    const incompatibleTask = createTask(
      incompatibleTaskDefinition as any,
      {},
      TaskPriority.MEDIUM,
    );

    const updates = calculateTaskAssignmentUpdates(
      [mockCreep],
      [incompatibleTask],
    );

    expect(updates).toEqual([[mockCreep, null]]);
  });

  const unassignedTask = createTask(
    definedTasks["fill-spawn"],
    { targetRoom: "E1S1" as TypedId<Room> },
    TaskPriority.MEDIUM,
  );
  const assignedTask = createTask(
    definedTasks["fill-spawn"],
    { targetRoom: "E1S1" as TypedId<Room> },
    TaskPriority.MEDIUM,
  );

  const idleCreep = mockInstanceOf<Creep>({
    $$typeof: undefined,
    name: "IdleCreep",
    memory: {
      role: "worker",
      assignedTask: null,
    },
  });

  const busyCreep = mockInstanceOf<Creep>({
    $$typeof: undefined,
    name: "BusyCreep",
    memory: {
      role: "worker",
      assignedTask: assignedTask.id as TypedId<Task>,
    },
  });

  assignedTask.assigneeId = busyCreep.name as TypedId<Creep>;

  it("should prefer assigning tasks to idle creeps", () => {
    const updates = calculateTaskAssignmentUpdates(
      [idleCreep, busyCreep],
      [assignedTask, unassignedTask],
    );

    const expected = [[idleCreep, unassignedTask]];

    expect(updates).toEqual(expected);
  });

  const anotherIdleCreep = mockInstanceOf<Creep>({
    $$typeof: undefined,
    name: "AnotherIdleCreep",
    memory: {
      role: "brute",
      assignedTask: null,
    },
  });

  const anotherUnassignedTask = createTask(
    definedTasks["attack-creeps"],
    { controllerId: "Controller1" as Id<StructureController> },
    TaskPriority.MEDIUM,
  );

  function sortTaskUpdates(
    updates: TaskAssignmentUpdate[],
  ): TaskAssignmentUpdate[] {
    return sortBy(updates, ([creep, task]) => {
      const creepName = hasValue(creep) ? creep.name : "";
      const taskId = hasValue(task) ? task.id : "";

      return `${creepName}-${taskId}`;
    });
  }

  it("should be able to assign tasks regardless of the order of creeps", () => {
    const updates1 = sortTaskUpdates(
      calculateTaskAssignmentUpdates(
        [anotherIdleCreep, idleCreep],
        [anotherUnassignedTask, unassignedTask],
      ),
    );

    const updates2 = sortTaskUpdates([
      [idleCreep, unassignedTask],
      [anotherIdleCreep, anotherUnassignedTask],
    ]);

    const expected = sortTaskUpdates([
      [anotherIdleCreep, anotherUnassignedTask],
      [idleCreep, unassignedTask],
    ]);

    expect(updates1).toEqual(expected);
    expect(updates2).toEqual(expected);
  });

  it("should be able to assign tasks regardless of the order of tasks", () => {
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

  const lowPriorityTask = createTask(
    definedTasks["fill-spawn"],
    { targetRoom: "E1S1" as TypedId<Room> },
    TaskPriority.LOW,
  );

  const highPriorityTask = createTask(
    definedTasks["fill-spawn"],
    { targetRoom: "E1S1" as TypedId<Room> },
    TaskPriority.HIGH,
  );

  it("should prefer assigning higher priority tasks", () => {
    const updates = calculateTaskAssignmentUpdates(
      [idleCreep],
      [lowPriorityTask, highPriorityTask],
    );

    expect(updates[0]?.[0]).toBe(idleCreep);
    expect(updates[0]?.[1]).toBe(highPriorityTask);
  });
});
