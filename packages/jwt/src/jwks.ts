import { JsonWebKeyset } from './types';

const cache: Record<string, JsonWebKeyset> = {};

/**
 * Load a json web keyset.
 */
export async function getJwks(issuer: string): Promise<JsonWebKeyset> {
  const url = new URL(issuer);
  url.pathname = '/.well-known/jwks.json';
  const href = url.href;
  if (!cache[href]) {
    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error(
        `Error loading jwks at ${url.href}. ${response.status} ${response.statusText}`
      );
    }
    cache[href] = await response.json();
  }
  return cache[href];
}
