import { defineRole } from "../defineRole";

export const heavyWorkerRole = defineRole({
  name: "heavy-worker",
  bodyComposition: {
    baseParts: [MOVE, CARRY, WORK, WORK, WORK],
    extraParts: [WORK],
  },
  assignableTaskTypes: ["harvest-resource"],
});
