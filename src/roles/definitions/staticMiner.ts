import { defineRole } from "../defineRole";

export const staticMinerRoleDefinition = defineRole({
  name: "static-miner",
  bodyComposition: {
    baseParts: [MOVE, WORK, WORK, WORK, WORK, WORK],
    extraParts: [WORK],
  },
  assignableTaskTypes: ["harvest-source"],
});
