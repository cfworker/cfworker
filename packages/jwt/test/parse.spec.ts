import { encode } from '@cfworker/base64url';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { importKey } from '../src/jwks.js';
import { parseJwt } from '../src/parse.js';
import { JwtHeader, JwtPayload } from '../src/types.js';

const iss = 'https://test.com';
const aud = 'test-aud';
const sub = 'test-sub';
const kid = 'xyz';
const iat = Math.floor(new Date().getTime() / 1000);

describe('parseJwt', () => {
  it('parses a valid JWT', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(true);
  });

  it('Accepts external jwks', async () => {
    const kid = 'abc';
    const iss = 'https://test2.com';
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud, {
      keys: [
        {
          kid,
          alg: 'RS256',
          e: 'AQAB',
          ext: true,
          key_ops: ['verify'],
          kty: 'RSA',
          n:
            'q1rk8wnDn93YHoSwtZ0PIn7maw-TqsqCR0kVBWM_UCtCQE6YigKwAASZBO5hH9orLUBVI4psjkKZQ2tj0roUGSDdFhgXt650goFq0r3knknhjy-Z5xMRYdwjvW85swC0nnCsGml-KeKRWLEtlrobzUyT7fP3m4vBiyCsru9mR7kiWlBShmjDyd3gAdMn2BjAC1HszNSUbCuoCUVch3YpAO6ApFiZa6f3qscMNOP5UFVdbvIx-robyQkU7Ocbbi2qrssyQTAAsamdN4b8lwOeraDy9euwp8QBgvwj6yKRT5pqC-ao-SDRzc_cwbLO02i6FDnrf3tLpAWxNS28Q3SXLQ'
        } as JsonWebKey
      ]
    });
    expect(result.valid).to.equal(true);
  });

  it('rejects unexpected algorithm', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects unexpected type', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWS', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects invalid issuer', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss: 'https://nefarious.com', aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects invalid audience', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud: 'nefarious', exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });

  it('rejects expired JWT', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) - 60;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud);
    expect(result.valid).to.equal(false);
  });
});

const privateKeys: Record<string, CryptoKey> = {};

async function createJwt(
  header: JwtHeader,
  payload: JwtPayload
): Promise<string> {
  const kid = header.kid;
  const iss = payload.iss;
  if (!privateKeys[kid]) {
    privateKeys[kid] = await generateKey({ iss, kid });
  }

  const data =
    encode(JSON.stringify(header)) + '.' + encode(JSON.stringify(payload));

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKeys[kid],
    new TextEncoder().encode(data)
  );

  return data + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function generateKey({ iss, kid }: { iss: string; kid: string }) {
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
  await importKey(iss, { ...jwk, kid } as JsonWebKey);
  return keyPair.privateKey;
}
