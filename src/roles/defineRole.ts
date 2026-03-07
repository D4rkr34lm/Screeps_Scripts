import { TaskType } from "../tasks/definitions";
import { BodyComposition } from "./bodyComposition";

export type Role<Name extends string = string> = Readonly<{
  name: Name;
  bodyComposition: BodyComposition;
  assignableTaskTypes: TaskType[];
}>;

export function defineRole<Name extends string>({
  name,
  bodyComposition,
  assignableTaskTypes,
}: {
  name: Name;
  bodyComposition: BodyComposition;
  assignableTaskTypes: TaskType[];
}): Role<Name> {
  return {
    name,
    bodyComposition,
    assignableTaskTypes,
  };
}
