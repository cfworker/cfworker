import { encode } from '@cfworker/base64url';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { importKey } from '../src/jwks.js';
import { parseJwt } from '../src/parse.js';
import { JwtHeader, JwtPayload } from '../src/types.js';

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

  it('Accepts external jwks', async () => {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    const header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'abc' };
    const payload = { iss, aud, exp, sub, iat };
    const jwt = await createJwt(header, payload);
    const result = await parseJwt(jwt, iss, aud, {
      keys: [
        {
          kid: 'abc',
          alg: 'RS256',
          e: 'AQAB',
          ext: true,
          key_ops: ['verify'],
          kty: 'RSA',
          n:
            'q9-bSyae6KkVo9rdgrvEW0BhfnHlSIMasKGCMbD7metqOzviVKz9_aWMUPTngwwT_gQRnXz7gUMZ8qc_E1AeX_VAcS9DQUJONJp8sogVXFABhkzQLBKg7eYn6_1tknwE-84L4toiTYduR2zwDAOWr3tfg8RI9BBwv5efTBw3SAqnedErobZqKY3ZSgI4y8hFxkYOLApZK6672HHck4gW5Xh0WY5kcKKa8jJYeqH479X_guugOBe3x7JcwpAaQKK7fH0A1F__citBsEym_VqdXlAhE_J5eiu8JWw3AkfXUUA3nPl1GmrGan1PCSmzhjxbvfwAsAQ1Y2GdWL8ErprEEw'
        } as JsonWebKey
      ]
    });
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
