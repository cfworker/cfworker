export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string | Array<string>;
  iat: number;
  exp: number;
  nbf?: number;
  jti?: string;
}

export interface JwtHeader {
  typ?: string;
  alg: string;
  kid: string;
}

export interface RawJwt {
  header: string;
  payload: string;
  signature: string;
}

/**
 * @typedef {object} DecodedJwt
 * @property {JwtHeader} header
 * @property {JwtPayload} payload
 * @property {string} signature
 * @property {RawJwt} raw
 */
export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: Uint8Array;
  raw: RawJwt;
}

export interface JsonWebKeyset {
  keys: JsonWebKey[];
}

export interface ValidJwtParseResult {
  valid: true;
  payload: JwtPayload;
}

export interface InvalidJwtParseResult {
  valid: false;
  reason: string;
}

export type JwtParseResult = ValidJwtParseResult | InvalidJwtParseResult;
