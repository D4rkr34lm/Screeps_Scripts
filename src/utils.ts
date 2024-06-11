function hasValue<T>(value: null | undefined | T): value is T {
  return value !== null && value !== undefined;
}

function hasNoValue<T>(value: null | undefined | T): value is T {
  return !(value !== null && value !== undefined);
}
