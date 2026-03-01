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

export function useAgentStorage() {
  const storage = useStorage();
  const agentStorageMap = storage.agents ?? {};

  function saveAgent(agent: Agent<any>): void {
    const record: AgentRecord = {
      id: agent.id,
      typeName: agent.type.name,
      memory: agent.memory,
    };
    agentStorageMap[agent.id] = record;
    storage.agents = agentStorageMap;
  }

  function loadAgent(agentId: string): Agent<any> | null {
    const record = agentStorageMap[agentId];
    const creep = Game.creeps[agentId];

    if (hasNoValue(record) || hasNoValue(creep)) {
      return null;
    }

    const agentType = record.typeName;

    if (!isAgentType(agentType)) {
      return null;
    }

    return {
      id: agentId,
      creep: creep,
      memory: record.memory,
      type: agentDefinitions[agentType],
    };
  }

  return { saveAgent, loadAgent };
}
