import { keys } from "lodash";
import { RoleMemory } from "./creepMemory";
import _ = require("lodash");

export type Role = RoleMemory["role"];

export interface SpawnerMemory {
  maxPerRole: { [role in Role]: number };
  currentPerRole: { [role in Role]: number };
}

function tick(spawner: StructureSpawn) {
  const roleParts: { [role in Role]: BodyPartConstant[] } = { worker: ["move", "carry", "work"] };

  if (_.isEqual(spawner.memory, {})) {
    initSpawner(spawner);
  }

  if (spawner.spawning) {
    return;
  }

  const memory = spawner.memory as SpawnerMemory;
  const maxPerRole = memory.maxPerRole;
  const currentPerRole = memory.currentPerRole;

  for (const role of keys(maxPerRole)) {
    if (currentPerRole[role] < maxPerRole[role]) {
      const name = _.uniqueId(role + "-");
      spawner.spawnCreep(roleParts[role], name);
      initCreepMemory(name, role as Role);
    }
  }
}

function initSpawner(spawner: StructureSpawn) {
  const defaultVal: SpawnerMemory = {
    maxPerRole: {
      worker: 5,
    },
    currentPerRole: {
      worker: 0,
    },
  };

  spawner.memory = defaultVal;
}

function initCreepMemory(creepId: string, role: Role) {
  const defaultVals: { [role in Role]: RoleMemory & { parts: BodyPartConstant[] } } = {
    worker: {
      role: "worker",
      gathering: false,
      parts: ["move", "carry", "work"],
    },
  };

  Memory.creeps[creepId] = defaultVals[role];
}

export default tick;
