/**
 * Base64 URL encode a string.
 */
export function encode(s: string): string {
  const escaped = encodeUnicode(s);
  const base64 = btoa(escaped);
  return base64.replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
}

function encodeUnicode(s: string): string {
  return encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}
