import { RoleMemory } from "./creepMemory";
const _ = require("lodash");

export type Role = RoleMemory["role"];

export interface SpawnerMemory {
  maxPerRole: { [role in Role]: number };
  currentPerRole: { [role in Role]: number };
}

const spawnerDefaultConfig: SpawnerMemory = {
  maxPerRole: {
    worker: 5,
  },
  currentPerRole: {
    worker: 0,
  },
};

const roleDefaultConfigs: { [role in Role]: RoleMemory } = {
  worker: {
    role: "worker",
    gathering: false,
  },
};

const roleParts: { [role in Role]: BodyPartConstant[] } = { worker: ["move", "carry", "work"] };

function tick(spawner: StructureSpawn) {
  if (_.isEqual(spawner.memory, {})) {
    initSpawner(spawner);
  }

  if (spawner.spawning) {
    return;
  }

  const memory = spawner.memory as SpawnerMemory;
  const maxPerRole = memory.maxPerRole;
  const currentPerRole = memory.currentPerRole;

  for (const role of _.keys(maxPerRole)) {
    if (currentPerRole[role] < maxPerRole[role]) {
      const name = _.uniqueId(role + "-");
      const spawnResult = spawner.spawnCreep(roleParts[role], name);

      if (spawnResult === OK) {
        memory.currentPerRole[role]++;
        initCreepMemory(name, role as Role);
      }
    }
  }
}

function initSpawner(spawner: StructureSpawn) {
  spawner.memory = spawnerDefaultConfig;
}

function initCreepMemory(creepId: string, role: Role) {
  Memory.creeps[creepId] = roleDefaultConfigs[role];
}

export default tick;
