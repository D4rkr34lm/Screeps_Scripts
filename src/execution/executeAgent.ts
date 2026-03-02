import { Agent } from "../agents/agentService";
import { useAgentStorage } from "../agents/agentStorage";

export function executeAgent<Memory>(context: {
  creep: Creep;
  room: Room;
  agent: Agent<Memory>;
}): void {
  const { creep, room, agent } = context;

  if (
    agent.creep.spawning ||
    agent.creep.ticksToLive === undefined ||
    agent.creep.ticksToLive <= 1
  ) {
    return;
  }

  const newMemory = agent.type.behavior({
    creep,
    room,
    memory: agent.memory,
  });

  if (newMemory !== undefined) {
    const agentStorage = useAgentStorage();
    agent.memory = newMemory;
    agentStorage.saveAgent(agent);
  }
}
