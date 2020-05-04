import { encode } from '@cfworker/base64url';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { importKey } from '../src/jwks';
import { parseJwt } from '../src/parse';
import { JwtHeader, JwtPayload } from '../src/types';

const iss = 'https://test.com';
const aud = 'test-aud';
const sub = 'test-sub';
const iat = Math.floor(new Date().getTime() / 1000);

describe('parseJwt', () => {
  it('parses a valid JWT', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'xyz' };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('rejects unexpected algorithm', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT', kid: 'xyz' };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects unexpected type', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWS', kid: 'xyz' };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects invalid issuer', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'xyz' };
    const payload = { iss: 'https://nefarious.com', aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects invalid audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'xyz' };
    const payload = { iss, aud: 'nefarious', exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects expired JWT', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) - 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'xyz' };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });
});

let privateKey: CryptoKey;

async function createJwt(
  header: JwtHeader,
  payload: JwtPayload
): Promise<string> {
  if (!privateKey) {
    privateKey = await generateKey();
  }

  const data =
    encode(JSON.stringify(header)) + '.' + encode(JSON.stringify(payload));

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  );

  return data + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function generateKey() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' }
    },
    true,
    ['sign', 'verify']
  );

  const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  await importKey(iss, jwk);
  return keyPair.privateKey;
}
