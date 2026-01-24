export function getFirstItem<T>(array: T[]): T {
  return array[0];
}

export function getLastItem<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined;
}

export function reorderArray<T extends { order: number }>(
  array: T[],
  start: number = 0
): T[] {
  return array.map((item, index) => ({ ...item, order: index + 1 + start }));
}
