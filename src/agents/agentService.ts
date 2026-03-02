import { first } from "lodash-es";
import { AgentDefinition } from "./defineAgent";
import { hasNoValue } from "../uitls";
import { useAgentStorage } from "./agentStorage";
import {
  getMaximalCompositionFactor,
  getScaledBodyParts,
} from "./bodyComposition";

export interface Agent<Memory> {
  id: string;
  type: AgentDefinition<Memory>;
  memory: Memory;
  creep: Creep;
}

export function useAgentService() {
  const agentStorage = useAgentStorage();

  function createAgent<Memory>(
    type: AgentDefinition<Memory>,
    room: Room,
  ): Agent<Memory> | null {
    const memory = type.createDefaultMemory();
    const name = `${type.name}-${Game.time}`;

    const roomSpawn = first(room.find(FIND_MY_SPAWNS));

    if (hasNoValue(roomSpawn)) {
      console.error({
        roomName: room.name,
        message: "No spawn found in room",
      });
      return null;
    } else if (roomSpawn.spawning) {
      console.error({
        roomName: room.name,
        message: "Spawn is currently spawning",
      });
      return null;
    }

    const bodyScalingFactor = getMaximalCompositionFactor(
      type.composition,
      room.energyAvailable,
    );

    const bodyParts = getScaledBodyParts(type.composition, bodyScalingFactor);

    const spawnResult = roomSpawn.spawnCreep(bodyParts, name);

    if (spawnResult !== OK) {
      console.error({
        roomName: room.name,
        typeName: type.name,
        message: `Failed to spawn creep with result code ${spawnResult}`,
      });
      return null;
    }

    const creep = Game.creeps[name];
    if (hasNoValue(creep)) {
      console.error({
        roomName: room.name,
        typeName: type.name,
        message: "Failed to retrieve spawned creep",
      });
      return null;
    }

    const agent = {
      id: name,
      type,
      memory,
      creep,
    };

    agentStorage.saveAgent(agent);

    return agent;
  }

  return {
    createAgent,
  };
}
