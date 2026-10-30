type ParsedEntries<T> = Record<string, T | T[]>;

export function parseEntries<T>(
  input: Iterable<readonly [string, T]>
): ParsedEntries<T> {
  const entries = new Map<string, T[]>();

  for (const [name, value] of input) {
    const values = entries.get(name);
    if (values === undefined) {
      entries.set(name, [value]);
    } else {
      values.push(value);
    }
  }

  return Object.fromEntries(
    Array.from(entries, ([name, values]) => [
      name,
      values.length === 1 ? values[0]! : values
    ])
  );
}
