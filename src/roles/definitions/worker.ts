import { defineRole } from "../defineRole";

export const workerRole = defineRole({
  name: "worker",
  bodyComposition: {
    baseParts: [WORK, CARRY, MOVE],
    extraParts: [WORK, CARRY, MOVE],
    sortParts: (parts) => {
      const workParts = parts.filter((part) => part === WORK);
      const carryParts = parts.filter((part) => part === CARRY);
      const moveParts = parts.filter((part) => part === MOVE);

      return [...workParts, ...carryParts, ...moveParts];
    },
  },
  assignableTaskTypes: [
    "build-structure",
    "fill-spawn",
    "upgrade-controller",
    "repair-structures",
  ],
});
