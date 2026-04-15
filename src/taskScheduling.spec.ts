import { describe, expect, it } from "vitest";
import { mockInstanceOf, mockGlobal } from "screeps-test-helper";
import { createTask, Task } from "./tasks/createTask";
import { TaskPriority } from "./tasks/priority";
import { defineTask } from "./tasks/defineTask";
import { calculateTaskAssignmentUpdates } from "./taskScheduling";
import { definedTasks } from "./tasks/definitions";
import { TypedId } from "./uitls";

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
    memory: {
      role: "worker",
      assignedTask: null,
    },
  });

  const busyCreep = mockInstanceOf<Creep>({
    memory: {
      role: "worker",
      assignedTask: assignedTask.id as TypedId<Task>,
    },
  });

  it("should prefer assigning tasks to idle creeps", () => {
    const updates = calculateTaskAssignmentUpdates(
      [idleCreep, busyCreep],
      [assignedTask, unassignedTask],
    );

    const expected = [[idleCreep, unassignedTask]];

    expect(updates).toEqual(expected);
  });
});
