import { defineRole } from "../defineRole";

export const founderRole = defineRole({
  name: "founder",
  bodyComposition: {
    baseParts: [WORK, CARRY, MOVE],
    extraParts: [WORK, CARRY, MOVE],
  },
});
