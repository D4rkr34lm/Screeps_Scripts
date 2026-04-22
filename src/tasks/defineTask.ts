export interface TaskDefinition<
  Name extends string = string,
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> {
  name: Name;
  execute: (args: Parameters & { creep: Creep }) => void;
  isFinished?: (args: Parameters) => boolean;
}

/**
 * Create a new, declarative task definition.
 * This is used to define the types of tasks that can be created in the colony.
 * You must register the returned TaskDefinition in the definedTasks object for it to be used in the colony
 */
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
