import { decodeJwt } from './decode.js';
import { DecodedJwt, JwtParseResult } from './types.js';
import { verifyJwtSignature } from './verify.js';

/**
 * Parse a JWT.
 */
export async function parseJwt(
  encodedToken: string,
  issuerOrigin: string,
  audience: string
): Promise<JwtParseResult> {
  let decoded: DecodedJwt;
  try {
    decoded = decodeJwt(encodedToken);
  } catch {
    return { valid: false, reason: `Unable to decode JWT.` };
  }
  if (decoded.header.typ !== 'JWT') {
    return {
      valid: false,
      reason: `Invalid JWT type "${decoded.header.typ}". Expected "JWT".`
    };
  }
  if (decoded.header.alg !== 'RS256') {
    return {
      valid: false,
      reason: `Invalid JWT algorithm "${decoded.header.alg}". Expected "RS256".`
    };
  }
  if (decoded.payload.aud !== audience) {
    return {
      valid: false,
      reason: `Invalid JWT audience "${decoded.payload.aud}". Expected "${audience}".`
    };
  }
  const iss = new URL(decoded.payload.iss);
  if (iss.origin !== issuerOrigin) {
    return {
      valid: false,
      reason: `Invalid JWT issuer "${decoded.payload.iss}". Expected "${issuerOrigin}".`
    };
  }
  const expiryDate = new Date(0);
  expiryDate.setUTCSeconds(decoded.payload.exp);
  const currentDate = new Date(Date.now());
  const expired = expiryDate <= currentDate;
  if (expired) {
    return {
      valid: false,
      reason: `JWT is expired. Expiry date: ${expiryDate}; Current date: ${currentDate};`
    };
  }
  let signatureValid: boolean;
  try {
    signatureValid = await verifyJwtSignature(decoded);
  } catch {
    return { valid: false, reason: `Error verifying JWT signature.` };
  }
  if (!signatureValid) {
    return { valid: false, reason: `JWT signature is invalid.` };
  }
  const payload = decoded.payload;
  return { valid: true, payload };
}
