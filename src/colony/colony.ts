import { ClaimedResource, syncLocalSource } from "../resources";
import { RoleName } from "../roles/definitions";
import { Task } from "../tasks/createTask";
import { getNewId, TypedId } from "../uitls";
import { ColonyStageName } from "./stages";

export type SpawnIntent = {
  role: RoleName;
  targetLevel: number;
};

export interface Colony {
  id: TypedId<this>;
  currentStage: ColonyStageName;
  room: TypedId<Room>;
  resources: ClaimedResource[];
  tasks: Task[];
  spawnIntents: SpawnIntent[];
  creeps: Array<TypedId<Creep>>;
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

  const claimedSources = sources
    .map((source) => source.id)
    .map(syncLocalSource);

  const newColony: Colony = {
    id: getNewId<Colony>(`colony-${room.name}`),
    currentStage: "founding",
    room: room.name as TypedId<Room>,
    resources: [...claimedSources],
    tasks: [],
    spawnIntents: [],
    creeps: [],
  };

  return newColony;
}
