import { pad } from './pad.js';

/**
 * Base64 URL decode a string.
 */
export function decode(s: string): string {
  const base64 = pad(s).replace(/_/g, '/').replace(/-/g, '+');

  return decodeURIComponent(Array.from(atob(base64), byteToPercent).join(''));
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`;
}
