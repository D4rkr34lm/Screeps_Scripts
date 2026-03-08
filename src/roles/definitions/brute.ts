import { defineRole } from "../defineRole";

export const bruteRole = defineRole({
  name: "brute",
  bodyComposition: {
    baseParts: [MOVE, ATTACK, TOUGH],
    extraParts: [MOVE, ATTACK, TOUGH],
    sortParts: (parts) => {
      const moveParts = parts.filter((p) => p === MOVE);
      const attackParts = parts.filter((p) => p === ATTACK);
      const toughParts = parts.filter((p) => p === TOUGH);
      return [...toughParts, ...attackParts, ...moveParts];
    },
  },
  assignableTaskTypes: ["attack-creeps"],
});
