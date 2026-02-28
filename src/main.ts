import { values } from "lodash-es";
import { executeCreeps } from "./execution/creepExecution";
import { deserializeTasks } from "./execution/taskDeserialisation";

export const isDebug: boolean = true;

function loop() {
  const taskMap = deserializeTasks();

  executeCreeps(values(Game.creeps), taskMap as any);
}
