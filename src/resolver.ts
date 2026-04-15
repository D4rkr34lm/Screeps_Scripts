import { hasNoValue } from "./uitls";

type Referenceable = Room | Creep;

type Ref<T extends Referenceable> = string & { __refBrand: T };

function getRoom(id: Ref<Room>): Room {
  const result = Game.rooms[id as string];

  if (hasNoValue(result)) {
    throw new Error(`Room not found: ${id}`);
  } else {
    return result;
  }
}

function getCreep(id: Ref<Creep>): Creep | null {
  const result = Game.creeps[id as string];

  if (hasNoValue(result)) {
    return null;
  } else {
    return result;
  }
}

export const Resolver = {
  getCreep,
  getRoom,
};
