import { bruteRole } from "./brute";
import { founderRole } from "./founder";
import { heavyWorkerRole } from "./heavyWorker";

export const definedRoles = {
  founder: founderRole,
  ["heavy-worker"]: heavyWorkerRole,
  brute: bruteRole,
};

export type RoleName = keyof typeof definedRoles;
