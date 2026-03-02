import { values } from "lodash-es";
import { useStorage } from "../storage";
import { hasNoValue } from "../uitls";
import { Agent } from "./agentService";
import { agentDefinitions, isAgentType } from "./definitions";

export interface AgentRecord {
  id: string;
  typeName: string;
  memory: unknown;
}

export interface AgentStorage {
  [agentId: string]: AgentRecord;
}

const agentMapper = {
  serialize(agent: Agent<any>): AgentRecord {
    return {
      id: agent.id,
      typeName: agent.type.name,
      memory: agent.memory,
    };
  },

  deserialize(record: AgentRecord): Agent<any> {
    const agentType = record.typeName;

    if (isAgentType(agentType)) {
      const creep = Game.creeps[record.id];

      if (hasNoValue(creep)) {
        throw new Error(`Creep with name ${record.id} not found.`);
      }

      const agentDefinition = agentDefinitions[agentType];
      return {
        id: record.id,
        creep: creep,
        memory: record.memory,
        type: agentDefinition,
      };
    } else {
      throw new Error(`Unknown agent type: ${agentType}`);
    }
  },
};

export function useAgentStorage() {
  const storage = useStorage();
  const agentStorageMap = storage.agents ?? {};

  function saveAgent(agent: Agent<any>): void {
    const record = agentMapper.serialize(agent);
    agentStorageMap[agent.id] = record;
    storage.agents = agentStorageMap;
  }

  function loadAgent(agentId: string): Agent<any> {
    const record = agentStorageMap[agentId];

    if (hasNoValue(record)) {
      throw new Error(`Agent with ID ${agentId} not found in storage.`);
    }

    const agent = agentMapper.deserialize(record);
    return agent;
  }

  function listAgents(): Agent<any>[] {
    return values(agentStorageMap).map((record) =>
      agentMapper.deserialize(record),
    );
  }

  return { saveAgent, loadAgent, listAgents };
}
