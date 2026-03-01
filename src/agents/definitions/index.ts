import { founderRole } from "./founder";

export const agentDefinitions = {
  founder: founderRole,
};

export type AgentType = keyof typeof agentDefinitions;

export function isAgentType(value: string): value is AgentType {
  return value in agentDefinitions;
}
