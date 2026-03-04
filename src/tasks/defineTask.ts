export interface TaskDefinition<
  Name extends string = string,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> {
  name: Name;
  execute: (args: Parameters & { creep: Creep }) => void;
  isFinished?: (args: Parameters) => boolean;
}

export function defineTask<
  Name extends string,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
>({
  name,
  execute,
  isFinished,
}: {
  name: Name;
  execute: (args: Parameters & { creep: Creep }) => void;
  isFinished?: (args: Parameters) => boolean;
}): TaskDefinition<Name, Parameters> {
  return {
    name,
    execute,
    isFinished,
  };
}
