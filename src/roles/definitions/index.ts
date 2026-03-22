import { bruteRole } from "./brute";
import { workerRole } from "./founder";
import { heavyWorkerRole } from "./heavyWorker";

export const definedRoles = {
  worker: workerRole,
  ["heavy-worker"]: heavyWorkerRole,
  brute: bruteRole,
};

export type RoleName = keyof typeof definedRoles;
