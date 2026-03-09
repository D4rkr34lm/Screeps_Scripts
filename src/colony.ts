import { getNewId, TypedId } from "./uitls";
import { initializeResource, ManagedResource } from "./resources";

export interface Colony {
  id: TypedId<this>;
  room: TypedId<Room>;
  resources: ManagedResource[];
}

export function storeColony(colony: Colony) {
  const memory = Memory.colonies || {};
  memory[colony.id] = colony;
  Memory.colonies = memory;
}

export function loadColonies(): { [key: TypedId<Colony>]: Colony } {
  return Memory.colonies || {};
}

export function initializeColony(room: Room): Colony {
  const sources = room.find(FIND_SOURCES);
  const sourceResources = sources.map((source) => ({
    type: "source" as const,
    id: source.id as string as TypedId<Source>,
  }));

  const managedResources = sourceResources.map(initializeResource);

  const newColony: Colony = {
    id: getNewId<Colony>(),
    room: room.name as TypedId<Room>,
    resources: managedResources,
  };

  return newColony;
}
