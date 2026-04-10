import { algToHash } from './algs.js';
import { DecodedJwt } from './types.js';

/**
 * Verify the JWT's signature.
 * @param {DecodedJwt} decoded
 */
export async function verifyJwtSignature(
  decoded: DecodedJwt,
  key: CryptoKey
): Promise<boolean> {
  if (key.algorithm.name !== 'RSASSA-PKCS1-v1_5') {
    throw new Error(
      `Unsupported key algorithm "${key.algorithm.name}": only RSASSA-PKCS1-v1_5 is supported.`
    );
  }
  const alg = decoded.header.alg;
  if (!algToHash[alg]) {
    throw new Error(
      `Unsupported JWT algorithm "${alg}": must be one of ${Object.keys(algToHash).join(', ')}.`
    );
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`${decoded.raw.header}.${decoded.raw.payload}`);

  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    decoded.signature,
    data
  );
}
