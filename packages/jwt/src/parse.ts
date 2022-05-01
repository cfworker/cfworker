import { algs, algToHash } from './algs.js';
import { decodeJwt } from './decode.js';
import { getKey } from './jwks.js';
import { DecodedJwt, JwtParseResult } from './types.js';
import { verifyJwtSignature } from './verify.js';

/**
 * Parse a JWT.
 */
export async function parseJwt(
  encodedToken: string,
  issuer: string,
  audience: string
): Promise<JwtParseResult> {
  let decoded: DecodedJwt;
  try {
    decoded = decodeJwt(encodedToken);
  } catch {
    return { valid: false, reason: `Unable to decode JWT.` };
  }
  if (
    typeof decoded.header.typ !== 'undefined' &&
    decoded.header.typ !== 'JWT'
  ) {
    return {
      valid: false,
      reason: `Invalid JWT type "${decoded.header.typ}". Expected "JWT".`
    };
  }
  if (!algToHash[decoded.header.alg]) {
    return {
      valid: false,
      reason: `Invalid JWT algorithm "${decoded.header.alg}". Supported: ${algs}.`
    };
  }
  if (
    typeof decoded.payload.aud === 'string' &&
    decoded.payload.aud !== audience
  ) {
    return {
      valid: false,
      reason: `Invalid JWT audience "${decoded.payload.aud}". Expected "${audience}".`
    };
  } else if (
    Array.isArray(decoded.payload.aud) &&
    !decoded.payload.aud.includes(audience)
  ) {
    return {
      valid: false,
      reason: `Invalid JWT audience in array "${decoded.payload.aud}". Does not include "${audience}".`
    };
  }

  if (decoded.payload.iss !== issuer) {
    return {
      valid: false,
      reason: `Invalid JWT issuer "${decoded.payload.iss}". Expected "${issuer}".`
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
  let key: CryptoKey;
  try {
    key = await getKey(decoded);
  } catch {
    return {
      valid: false,
      reason: `Error retrieving key to verify JWT signature.`
    };
  }
  let signatureValid: boolean;
  try {
    signatureValid = await verifyJwtSignature(decoded, key);
  } catch {
    return { valid: false, reason: `Error verifying JWT signature.` };
  }
  if (!signatureValid) {
    return { valid: false, reason: `JWT signature is invalid.` };
  }
  const payload = decoded.payload;
  return { valid: true, payload };
}
