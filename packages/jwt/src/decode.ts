import { base64url } from 'rfc4648';
import { DecodedJwt } from './types.js';

/**
 * Decode a JWT into header, payload, and signature components.
 */
export function decodeJwt(token: string): DecodedJwt {
  const [header, payload, signature] = token.split('.');
  const decoder = new TextDecoder();
  return {
    header: JSON.parse(
      decoder.decode(base64url.parse(header, { loose: true }))
    ),
    payload: JSON.parse(
      decoder.decode(base64url.parse(payload, { loose: true }))
    ),
    signature: base64url.parse(signature, { loose: true }),
    raw: { header, payload, signature }
  };
}
