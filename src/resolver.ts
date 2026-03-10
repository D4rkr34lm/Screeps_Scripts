import { hasNoValue, TypedId } from "./uitls";

function getSource(id: TypedId<Source>): Source {
  const result = Game.getObjectById(id as string as Id<Source>);

  if (hasNoValue(result)) {
    throw new Error(`Source not found: ${id}`);
  } else {
    return result;
  }
}

function getRoom(id: TypedId<Room>): Room {
  const result = Game.rooms[id as string];

  if (hasNoValue(result)) {
    throw new Error(`Room not found: ${id}`);
  } else {
    return result;
  }
}

function getCreep(id: TypedId<Creep>): Creep | null {
  const result = Game.creeps[id as string];

  if (hasNoValue(result)) {
    return null;
  } else {
    return result;
  }
}

export const Resolver = {
  getSource,
  getCreep,
  getRoom,
};
