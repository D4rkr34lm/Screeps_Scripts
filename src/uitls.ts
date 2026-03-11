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

export function getNewId<T>(prefix?: string): TypedId<T> {
  return `${prefix}-${uid()}` as TypedId<T>;
}
