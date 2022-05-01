import { expect } from 'chai';
import { describe, it } from 'mocha';
import { base64url } from 'rfc4648';
import { algs, algToHash } from '../src/algs.js';
import { importKey } from '../src/jwks.js';
import { parseJwt } from '../src/parse.js';
import { JwtHeader, JwtPayload } from '../src/types.js';

const iss = 'https://test.com';
const aud = 'test-aud';
const sub = 'test-sub';
const kid = 'xyz';
const iat = Math.floor(new Date().getTime() / 1000);
const nbf = iat;

describe('parseJwt', () => {
  for (const alg of algs) {
    it(`parses a valid ${alg} JWT`, async () => {
      const kid = crypto.randomUUID();
      const exp = Math.floor(new Date().getTime() / 1000) + 10;
      const header: JwtHeader = { alg, typ: 'JWT', kid };
      const payload = { iss, aud, exp, sub, iat, nbf };
      const jwt = await createJwt(kid, alg, header, payload);
      const result = await parseJwt(jwt, iss, aud);
      expect(result.valid).to.equal(true);
    });
  }

  it('rejects unexpected header algorithm', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects unexpected type', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWS', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('accepts undefined type', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('rejects invalid issuer', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss: 'https://nefarious.com', aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects non-string issuer', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss: 123 as any, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, 123 as any, aud);
    expect(result.valid).to.equal(false);
  });

  it('accepts array audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', kid };
    const payload = { iss, aud: [aud, 'another-aud'], exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('rejects invalid audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud: 'nefarious', exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects non-string audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud: 123 as any, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, 123 as any);
    expect(result.valid).to.equal(false);
  });

  it('rejects empty array audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud: [], exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects mixed array audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud: ['hello', 234422 as any], exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects expired JWT', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) - 120;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects non-number exp', async () => {
    const exp = String(Math.floor(new Date().getTime() / 1000) + 120) as any;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('allows for clock skew in exp', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) - 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('nbf claim is optional', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    // const nbf = Math.floor(new Date().getTime() / 1000) - 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('allows for clock skew in nbf', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const nbf = Math.floor(new Date().getTime() / 1000) + 5;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('rejects jwt used to early (nbf)', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const nbf = Math.floor(new Date().getTime() / 1000) + 120;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('allows for clock skew in iat', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 30;
    const iat = Math.floor(new Date().getTime() / 1000) + 20;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('rejects future iat', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 120;
    const iat = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat, nbf };
    const jwt = await createJwt(kid, 'RS256', header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });
});

let privateKey: Record<string, CryptoKey> = {};

async function createJwt(
  kid: string,
  alg: string,
  header: JwtHeader,
  payload: JwtPayload
): Promise<string> {
  if (!privateKey[kid]) {
    privateKey[kid] = await generateKey(kid, alg);
  }
  const encoder = new TextEncoder();
  const data =
    base64url.stringify(encoder.encode(JSON.stringify(header))) +
    '.' +
    base64url.stringify(encoder.encode(JSON.stringify(payload)));

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey[kid],
    encoder.encode(data)
  );

  return data + '.' + base64url.stringify(new Uint8Array(signature));
}

async function generateKey(kid: string, alg: string) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: algToHash[alg] }
    },
    true,
    ['sign', 'verify']
  );

  const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey!);
  await importKey(iss, { ...jwk, kid } as JsonWebKey);
  return keyPair.privateKey!;
}
