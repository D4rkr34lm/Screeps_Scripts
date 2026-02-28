import { founderRole } from "./definitions/founder";

export const roleDefinitions = {
  founder: founderRole,
};

export type RoleName = keyof typeof roleDefinitions;

export function isRoleName(value: string): value is RoleName {
  return value in roleDefinitions;
}

export type Role = (typeof roleDefinitions)[RoleName];
