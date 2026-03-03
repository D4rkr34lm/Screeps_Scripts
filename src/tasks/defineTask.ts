export interface TaskDefinition<
  Name extends string = string,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> {
  name: Name;
  execute: (args: Parameters & { creep: Creep }) => void;
}

export function defineTask<
  Name extends string,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  execute,
}: {
  name: Name;
  execute: (args: Parameters & { creep: Creep }) => void;
}): TaskDefinition<Name, Parameters> {
  return {
    name,
    execute,
  };
}
