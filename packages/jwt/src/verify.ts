import { DecodedJwt, JsonWebKeyset } from './types';

/**
 * Verify
 * TODO: refactor this to preserve reference to verification function.
 * No need to import the key on each signature verification.
 * @param {DecodedJwt} decoded
 */
export async function verifyJwtSignature(
  decoded: DecodedJwt,
  jwks: JsonWebKeyset
) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${decoded.raw.header}.${decoded.raw.payload}`);
  const signature = new Uint8Array(
    Array.from(decoded.signature).map(c => c.charCodeAt(0))
  );
  const {
    keys: [{ x5c, n, kid, x5t }]
  } = jwks;
  const jwk = {
    alg: 'RS256',
    kty: 'RSA',
    key_ops: ['verify'],
    use: 'sig',
    x5c,
    n,
    e: 'AQAB',
    kid,
    x5t
  };
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data);
}
