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
  jku?: string;
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

export interface IssuerMetadata {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  jwks_uri?: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  end_session_endpoint?: string;
  registration_endpoint?: string;
  token_endpoint_auth_methods_supported?: string[];
  token_endpoint_auth_signing_alg_values_supported?: string[];
  introspection_endpoint_auth_methods_supported?: string[];
  introspection_endpoint_auth_signing_alg_values_supported?: string[];
  revocation_endpoint_auth_methods_supported?: string[];
  revocation_endpoint_auth_signing_alg_values_supported?: string[];
  request_object_signing_alg_values_supported?: string[];
  mtls_endpoint_aliases?: MtlsEndpointAliases;
  [key: string]: unknown;
}

export interface MtlsEndpointAliases {
  token_endpoint?: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  introspection_endpoint?: string;
  device_authorization_endpoint?: string;
}

export type JwtParseResult = ValidJwtParseResult | InvalidJwtParseResult;
