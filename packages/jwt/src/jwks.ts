import { algToHash } from './algs.js';
import { DecodedJwt, JsonWebKeyset } from './types.js';

/**
 * Fetch a json web keyset.
 */
export async function getJwks(issuer: string): Promise<JsonWebKeyset> {
  const url = new URL(issuer);
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  url.pathname += '.well-known/jwks.json';
  const response = await fetch(url.href);
  if (!response.ok) {
    throw new Error(
      `Error loading jwks at ${url.href}. ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

const importedKeys: Record<string, Record<string, CryptoKey>> = {};

/**
 * Import and cache a JsonWebKeyset
 * @param iss The issuer. Serves as the first-level cache key.
 * @param jwks The JsonWebKeyset to import.
 */
export async function importKey(iss: string, jwk: JsonWebKey) {
  if (jwk.kty !== 'RSA') {
    throw new Error(`Unsupported jwk key type (kty) "${jwk.kty}".`);
  }
  const hash = jwk.alg ? algToHash[jwk.alg] : null;
  if (!hash) {
    throw new Error(`Unsupported jwk Algorithm (alg) "${jwk.alg}".`);
  }
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash },
    false,
    ['verify']
  );
  importedKeys[iss] = importedKeys[iss] || {};
  importedKeys[iss][jwk.kid ?? 'default'] = key;
}

/**
 * Get the CryptoKey associated with the JWT's issuer.
 */
export async function getKey(decoded: DecodedJwt): Promise<CryptoKey> {
  let {
    header: { kid = 'default' },
    payload: { iss }
  } = decoded;

  if (!importedKeys[iss]) {
    const jwks = await getJwks(iss);
    await Promise.all(jwks.keys.map(jwk => importKey(iss, jwk)));
  }

  const key = importedKeys[iss][kid];

  if (!key) {
    throw new Error(`Error jwk not found. iss: ${iss}; kid: ${kid};`);
  }

  return key;
}
