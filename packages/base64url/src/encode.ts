import { base64url } from 'rfc4648';

/**
 * Base64 URL encode a string.
 * @deprecated Use rfc4648 package directly
 */
export function encode(s: string): string {
  return base64url.stringify(new TextEncoder().encode(s), { pad: false });
}
