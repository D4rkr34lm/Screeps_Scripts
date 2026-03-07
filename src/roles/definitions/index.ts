import { founderRole } from "./founder";

export const definedRoles = {
  founder: founderRole,
};

export type RoleName = keyof typeof definedRoles;
