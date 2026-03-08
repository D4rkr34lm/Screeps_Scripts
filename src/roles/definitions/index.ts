import { bruteRole } from "./brute";
import { founderRole } from "./founder";
import { staticMinerRoleDefinition } from "./staticMiner";

export const definedRoles = {
  founder: founderRole,
  ["static-miner"]: staticMinerRoleDefinition,
  brute: bruteRole,
};

export type RoleName = keyof typeof definedRoles;
