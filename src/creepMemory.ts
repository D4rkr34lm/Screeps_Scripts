export interface GathererRole extends CreepMemory {
  role: "gatherer";
  gathering: boolean;
}

export type RoleMemory = GathererRole;
