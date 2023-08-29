import { algs, algToHash } from './algs.js';
import { decodeJwt } from './decode.js';
import { getKey } from './jwks.js';
import { DecodedJwt, JwtParseResult } from './types.js';
import { verifyJwtSignature } from './verify.js';

const skewMs = 30 * 1000;

/**
 * Parse a JWT.
 */
export async function parseJwt(
  encodedToken: string,
  issuer: string | string[],
  audience: string,
  resolveKey: (decoded: DecodedJwt) => Promise<CryptoKey | null> = getKey
): Promise<JwtParseResult> {
  let decoded: DecodedJwt;
  try {
    decoded = decodeJwt(encodedToken);
  } catch {
    return { valid: false, reason: `Unable to decode JWT.` };
  }
  const { typ, alg } = decoded.header;
  if (typeof typ !== 'undefined' && typ !== 'JWT') {
    return {
      valid: false,
      reason: `Invalid JWT type ${JSON.stringify(typ)}. Expected "JWT".`
    };
  }
  if (!algToHash[alg]) {
    return {
      valid: false,
      reason: `Invalid JWT algorithm ${JSON.stringify(
        alg
      )}. Supported: ${algs}.`
    };
  }

  const { sub, aud, iss, iat, exp, nbf } = decoded.payload;
  if (typeof sub !== 'string') {
    return {
      valid: false,
      reason: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(
        sub
      )}.`
    };
  }

  if (typeof aud === 'string') {
    if (aud !== audience) {
      return {
        valid: false,
        reason: `Invalid JWT audience claim (aud) ${JSON.stringify(
          aud
        )}. Expected "${audience}".`
      };
    }
  } else if (
    Array.isArray(aud) &&
    aud.length > 0 &&
    aud.every(a => typeof a === 'string')
  ) {
    if (!aud.includes(audience)) {
      return {
        valid: false,
        reason: `Invalid JWT audience claim array (aud) ${JSON.stringify(
          aud
        )}. Does not include "${audience}".`
      };
    }
  } else {
    return {
      valid: false,
      reason: `Invalid JWT audience claim (aud) ${JSON.stringify(
        aud
      )}. Expected a string or a non-empty array of strings.`
    };
  }

  if (!(iss === issuer || (Array.isArray(issuer) && issuer.includes(iss)))) {
    return {
      valid: false,
      reason: `Invalid JWT issuer claim (iss) ${JSON.stringify(
        decoded.payload.iss
      )}. Expected ${JSON.stringify(issuer)}.`
    };
  }

  if (typeof exp !== 'number') {
    return {
      valid: false,
      reason: `Invalid JWT expiry date claim (exp) ${JSON.stringify(
        exp
      )}. Expected number.`
    };
  }
  const currentDate = new Date(Date.now());
  const expiryDate = new Date(0);
  expiryDate.setUTCSeconds(exp);
  const expired = expiryDate.getTime() <= currentDate.getTime() - skewMs;
  if (expired) {
    return {
      valid: false,
      reason: `JWT is expired. Expiry date: ${expiryDate}; Current date: ${currentDate};`
    };
  }

  if (nbf !== undefined) {
    if (typeof nbf !== 'number') {
      return {
        valid: false,
        reason: `Invalid JWT not before date claim (nbf) ${JSON.stringify(
          nbf
        )}. Expected number.`
      };
    }
    const notBeforeDate = new Date(0);
    notBeforeDate.setUTCSeconds(nbf);
    const early = notBeforeDate.getTime() > currentDate.getTime() + skewMs;
    if (early) {
      return {
        valid: false,
        reason: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate}; Current date: ${currentDate};`
      };
    }
  }

  if (iat !== undefined) {
    if (typeof iat !== 'number') {
      return {
        valid: false,
        reason: `Invalid JWT issued at date claim (iat) ${JSON.stringify(
          iat
        )}. Expected number.`
      };
    }
    const issuedAtDate = new Date(0);
    issuedAtDate.setUTCSeconds(iat);
    const postIssued = issuedAtDate.getTime() > currentDate.getTime() + skewMs;
    if (postIssued) {
      return {
        valid: false,
        reason: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate}; Current date: ${currentDate};`
      };
    }
  }

  let key: CryptoKey | null;
  try {
    key = await resolveKey(decoded);
  } catch (e) {
    return {
      valid: false,
      reason: `Error retrieving public key to verify JWT signature: ${
        e instanceof Error ? e.message : e
      }`
    };
  }
  if (!key) {
    return {
      valid: false,
      reason: `Unable to resolve public key to verify JWT signature.`
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
