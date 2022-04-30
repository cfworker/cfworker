import { DecodedJwt } from './types.js';

/**
 * Verify the JWT's signature.
 * @param {DecodedJwt} decoded
 */
export async function verifyJwtSignature(decoded: DecodedJwt, key: CryptoKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${decoded.raw.header}.${decoded.raw.payload}`);

  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    decoded.signature,
    data
  );
}
