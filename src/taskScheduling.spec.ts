import { describe, expect, it } from "vitest";
import { mockInstanceOf } from "screeps-jest";
import { createTask } from "./tasks/createTask";
import { TaskPriority } from "./tasks/priority";
import { defineTask } from "./tasks/defineTask";
import { calculateTaskAssignmentUpdates } from "./taskScheduling";

const incompatibleTaskDefinition = defineTask({
  name: "incompatible",
  execute: () => {},
  isFinished: () => false,
});

describe("calculateTaskAssignmentUpdates", () => {
  it("should not assign tasks to creeps with incompatible roles", () => {
    const mockCreep = mockInstanceOf<Creep>({
      memory: {
        role: "brute",
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
});
