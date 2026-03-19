import { Task } from "../tasks/createTask";
import { Colony, SpawnIntent } from "./colony";

export type ColonyStage<Name extends string> = {
  name: Name;
  isComplete: (colony: Colony) => boolean;
  planNewTasks: (colony: Colony) => Task[];
  planNewCreeps: (colony: Colony) => SpawnIntent[];
};
