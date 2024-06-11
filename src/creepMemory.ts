export interface BasicCreepMemory extends CreepMemory {
  role: string;
  spawnedBy?: string;
}

export interface WorkerRole extends BasicCreepMemory {
  role: "worker";
  gathering: boolean;
}

export type RoleMemory = WorkerRole;
