import { BodyPart } from "../bodyParts";
import { createTask } from "../tasks/createTask";

type Behavior<Memory> = (context: {
  creep: Creep;
  room: Room;
  memory: Memory;
  task?: ReturnType<typeof createTask>;
}) => undefined | Memory;

export interface BodyCompositionLevel {
  cost: number;
  parts: BodyPart[];
}

interface Role<Memory> {
  name: string;
  compositionsLevel: BodyCompositionLevel[];
  behavior: Behavior<Memory>;
}

export function defineRole<Memory>({
  name,
  compositionsLevel,
  behavior,
}: {
  name: string;
  compositionsLevel: BodyCompositionLevel[];
  behavior: Behavior<Memory>;
}): Role<Memory> {
  return { name, compositionsLevel, behavior };
}
