import { base64url } from 'rfc4648';

/**
 * Base64 URL decode a string.
 * @deprecated Use rfc4648 package directly
 */
export function decode(s: string): string {
  return new TextDecoder().decode(base64url.parse(s, { loose: true }));
}
