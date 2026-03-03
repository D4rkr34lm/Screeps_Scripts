import { BodyComposition } from "./bodyComposition";

export type Role<Name extends string = string> = Readonly<{
  name: Name;
  bodyComposition: BodyComposition;
}>;

export function defineRole<Name extends string>({
  name,
  bodyComposition,
}: {
  name: Name;
  bodyComposition: BodyComposition;
}): Role<Name> {
  return {
    name,
    bodyComposition,
  };
}
