// @ts-ignore
import { base64url } from 'rfc4648';
import { DecodedJwt } from './types.js';

/**
 * Decode a JWT into header, payload, and signature components.
 */
export function decodeJwt(token: string): DecodedJwt {
  const segments = token.split('.');
  const header = segments[0];
  const payload = segments[1];
  const signature = segments[2];
  if (
    segments.length !== 3 ||
    header === undefined ||
    payload === undefined ||
    signature === undefined
  ) {
    throw new TypeError('JWT must contain three segments.');
  }
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
