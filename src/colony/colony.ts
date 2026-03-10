import { ManagedResource, initializeResource } from "../resources";
import { Task } from "../tasks/createTask";
import { getNewId, TypedId } from "../uitls";
import { ColonyStageName } from "./stages";

export interface Colony {
  id: TypedId<this>;
  currentStage: ColonyStageName;
  room: TypedId<Room>;
  resources: ManagedResource[];
  tasks: Task[];
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
    currentStage: "founding",
    room: room.name as TypedId<Room>,
    resources: managedResources,
    tasks: [],
  };

  return newColony;
}
