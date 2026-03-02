import { Task } from "../tasks/taskService";
import { BodyComposition } from "./bodyComposition";

type Behavior<Memory> = (context: {
  creep: Creep;
  room: Room;
  memory: Memory;
  task?: Task<any, any>;
}) => undefined | Memory;

export interface AgentDefinition<Memory> {
  name: string;
  composition: BodyComposition;
  createDefaultMemory: () => Memory;
  behavior: Behavior<Memory>;
}

export function defineAgent<Memory>({
  name,
  composition,
  createDefaultMemory,
  behavior,
}: {
  name: string;
  composition: BodyComposition;
  createDefaultMemory: () => Memory;
  behavior: Behavior<Memory>;
}): AgentDefinition<Memory> {
  return { name, composition, createDefaultMemory, behavior };
}
