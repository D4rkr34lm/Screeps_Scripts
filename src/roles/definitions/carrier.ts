import { defineRole } from "../defineRole";

export const carrierRole = defineRole({
  name: "carrier",
  bodyComposition: {
    baseParts: [CARRY, CARRY, MOVE],
    extraParts: [CARRY, CARRY, MOVE],
    sortParts: (parts) => {
      const carryParts = parts.filter((part) => part === CARRY);
      const moveParts = parts.filter((part) => part === MOVE);

      return [...carryParts, ...moveParts];
    },
  },
  assignableTaskTypes: ["fill-spawn"],
});
