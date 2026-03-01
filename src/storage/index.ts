import { AgentStorage } from "../agents/agentStorage";
import { TaskStorage } from "../tasks/taskStorage";

export function useStorage() {
  return Memory as Omit<Memory, "creeps"> & {
    tasks?: TaskStorage;
    agents?: AgentStorage;
  };
}
