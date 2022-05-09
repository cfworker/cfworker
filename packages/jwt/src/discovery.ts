import { IssuerMetadata } from './types';

/**
 * Fetch an oidc discovery document
 */
export async function getIssuerMetadata(
  issuer: string
): Promise<IssuerMetadata> {
  const url = new URL(issuer);
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  url.pathname += '.well-known/openid-configuration';
  const response = await fetch(url.href);
  if (!response.ok) {
    throw new Error(
      `Error loading OpenID discovery document at ${url.href}. ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
