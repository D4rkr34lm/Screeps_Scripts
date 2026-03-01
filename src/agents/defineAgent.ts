import { BodyPart } from "../bodyParts";
import { Task } from "../tasks/taskService";

type Behavior<Memory> = (context: {
  creep: Creep;
  room: Room;
  memory: Memory;
  task?: Task<any, any>;
}) => undefined | Memory;

export interface BodyCompositionLevel {
  cost: number;
  parts: BodyPart[];
}

export interface AgentDefinition<Memory> {
  name: string;
  compositionsLevel: BodyCompositionLevel[];
  createDefaultMemory: () => Memory;
  behavior: Behavior<Memory>;
}

export function defineAgent<Memory>({
  name,
  compositionsLevel,
  createDefaultMemory,
  behavior,
}: {
  name: string;
  compositionsLevel: BodyCompositionLevel[];
  createDefaultMemory: () => Memory;
  behavior: Behavior<Memory>;
}): AgentDefinition<Memory> {
  return { name, compositionsLevel, createDefaultMemory, behavior };
}
