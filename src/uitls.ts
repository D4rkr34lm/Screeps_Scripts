import { uid } from "uid";

export function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function hasNoValue<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value === null || value === undefined;
}

export type TypedId<T> = string & { __type: T };

export function getNewId<T>(prefix: string): TypedId<T> {
  return `${prefix}-${uid()}` as TypedId<T>;
}

export function shiftFromIf<T>(
  array: T[],
  predicate: (item: T) => boolean,
): T | null {
  const index = array.findIndex(predicate);

  return index !== -1 ? (array.splice(index, 1)[0] ?? null) : null;
}
