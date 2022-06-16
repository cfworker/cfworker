import { algToHash } from './algs.js';
import { getIssuerMetadata } from './discovery.js';
import { DecodedJwt, JsonWebKeyset } from './types.js';

/**
 * Fetch a json web keyset.
 */
export async function getJwks(issuer: string): Promise<JsonWebKeyset> {
  const issuerMetadata = await getIssuerMetadata(issuer);

  let url;
  if (issuerMetadata.jwks_uri) {
    url = new URL(issuerMetadata.jwks_uri);
  } else {
    url = new URL(issuer);
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    url.pathname += '.well-known/jwks.json';
  }

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
    throw new Error(
      `Unsupported jwk key type (kty) "${
        jwk.kty
      }": Full JWK was ${JSON.stringify(jwk)}`
    );
  }
  // alg is not mandatory in a JWK but is available in the JWT, for now we default to
  // SHA-256 (RS256) because this is the most common but evaluating the key length
  // of the JWKS is probably an ideal way of identifying what the alg is.
  const hash = jwk.alg ? algToHash[jwk.alg] : 'SHA-256';
  if (!hash) {
    throw new Error(
      `Unsupported jwk Algorithm (alg) "${
        jwk.alg
      }": Full JWK was ${JSON.stringify(jwk)}`
    );
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
  const {
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
