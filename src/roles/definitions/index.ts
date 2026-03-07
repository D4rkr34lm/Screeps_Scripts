import { founderRole } from "./founder";
import { staticMinerRoleDefinition } from "./staticMiner";

export const definedRoles = {
  founder: founderRole,
  ["static-miner"]: staticMinerRoleDefinition,
};

export type RoleName = keyof typeof definedRoles;
