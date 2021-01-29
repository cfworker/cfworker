/**
 * Convert an iterable to an object.
 */
export function toObject<
  TKey extends string | number | symbol,
  TValue
>(iterable: {
  [Symbol.iterator](): IterableIterator<[TKey, TValue]>;
}): Record<TKey, TValue> {
  const obj = Object.create(null) as Record<TKey, TValue>;
  for (const [key, value] of iterable) {
    obj[key] = value;
  }
  return obj;
}
