/**
 * Escape non-ASCII characters as \uXXXX
 */
export function escapeNonASCII(s: string) {
  return s.replace(
    /[\u0080-\uFFFF]/g,
    m => '\\u' + m.charCodeAt(0).toString(16).padStart(4, '0')
  );
}

/**
 * Asserts argument is truthy.
 * @param name Argument name.
 * @param value Argument value.
 */
export function assertArg(name: string, value: any): asserts value {
  if (!value) {
    throw new Error(`${name} is required.`);
  }
}

/**
 * Template literal tag which URI encodes values.
 */
export function uri(strings: TemplateStringsArray, ...values: any[]) {
  let s = strings[0];
  for (let i = 0; i < values.length; i++) {
    s += encodeURIComponent(values[i]) + strings[i + 1];
  }
  return s;
}
