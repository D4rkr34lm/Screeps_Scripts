export interface WorkerRole extends CreepMemory {
  role: "worker";
  gathering: boolean;
}

export type RoleMemory = WorkerRole;
