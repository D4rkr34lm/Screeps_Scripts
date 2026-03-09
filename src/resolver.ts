import { hasNoValue, TypedId } from "./uitls";

function getSource(id: TypedId<Source>): Source {
  const result = Game.getObjectById(id as string as Id<Source>);

  if (hasNoValue(result)) {
    throw new Error(`Source not found: ${id}`);
  } else {
    return result;
  }
}

function getMineral(id: TypedId<Mineral>): Mineral {
  const result = Game.getObjectById(id as string as Id<Mineral>);

  if (hasNoValue(result)) {
    throw new Error(`Mineral not found: ${id}`);
  } else {
    return result;
  }
}

export const Resolver = {
  getSource,
  getMineral,
};
