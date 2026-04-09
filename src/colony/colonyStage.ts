import { Task } from "../tasks/createTask";
import { Colony, SpawnIntent } from "./colony";

// TODO spawning intents should be planned as part as a result of tasks
export type ColonyStage<Name extends string> = {
  name: Name;
  isComplete: (colony: Colony) => boolean;
  planNewTasks: (colony: Colony) => Task[];
  planNewCreeps: (colony: Colony) => SpawnIntent[];
};
