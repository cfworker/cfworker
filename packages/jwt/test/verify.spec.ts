import { expect } from 'chai';
import { DecodedJwt } from '../src/types.js';
import { verifyJwtSignature } from '../src/verify.js';

describe('verifyJwtSignature', () => {
  it('rejects keys using a different algorithm', async () => {
    const key = {
      algorithm: { name: 'HMAC' }
    } as CryptoKey;

    const error = await getError(() =>
      verifyJwtSignature(createDecodedJwt('RS256'), key)
    );

    expect(error.message).to.equal(
      'Unsupported key algorithm "HMAC": only RSASSA-PKCS1-v1_5 is supported.'
    );
  });

  it('rejects unsupported JWT algorithms', async () => {
    const key = {
      algorithm: { name: 'RSASSA-PKCS1-v1_5' }
    } as CryptoKey;

    const error = await getError(() =>
      verifyJwtSignature(createDecodedJwt('HS256'), key)
    );

    expect(error.message).to.equal(
      'Unsupported JWT algorithm "HS256": must be one of RS256, RS384, RS512.'
    );
  });
});

function createDecodedJwt(alg: string): DecodedJwt {
  return {
    header: { alg, kid: 'test-key' },
    payload: {
      iss: 'https://example.com',
      sub: 'test-subject',
      aud: 'test-audience',
      iat: 0,
      exp: 1
    },
    signature: new Uint8Array(),
    raw: { header: '', payload: '', signature: '' }
  };
}

async function getError(action: () => Promise<unknown>): Promise<Error> {
  try {
    await action();
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
    throw error;
  }
  throw new Error('Expected action to throw.');
}
