import { expect } from 'chai';
import { base64url } from 'rfc4648';
import { decodeJwt } from '../src/decode.js';

describe('decodeJwt', () => {
  const encoded =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const [rawHeader, rawPayload, rawSignature] = splitJwt(encoded);

  const encodedUndefinedType =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.GuoUe6tw79bJlbU1HU0ADX0pr0u2kf3r_4OdrDufSfQ';
  const [
    rawHeaderUndefinedType,
    rawPayloadUndefinedType,
    rawSignatureUndefinedType
  ] = splitJwt(encodedUndefinedType);

  it('decodes a JWT', () => {
    expect(decodeJwt(encoded)).to.eql({
      header: {
        alg: 'HS256',
        typ: 'JWT'
      },
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      },
      signature: base64url.parse(rawSignature, { loose: true }),
      raw: {
        header: rawHeader,
        payload: rawPayload,
        signature: rawSignature
      }
    });
  });

  it('decodes a JWT with undefined type', () => {
    expect(decodeJwt(encodedUndefinedType)).to.eql({
      header: {
        alg: 'HS256'
      },
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      },
      signature: base64url.parse(rawSignatureUndefinedType, { loose: true }),
      raw: {
        header: rawHeaderUndefinedType,
        payload: rawPayloadUndefinedType,
        signature: rawSignatureUndefinedType
      }
    });
  });

  it('rejects a JWT without three segments', () => {
    expect(() => decodeJwt('header.payload')).to.throw(
      TypeError,
      'JWT must contain three segments.'
    );
  });
});

function splitJwt(token: string): [string, string, string] {
  const [header, payload, signature, extra] = token.split('.');
  if (
    header === undefined ||
    payload === undefined ||
    signature === undefined ||
    extra !== undefined
  ) {
    throw new TypeError('Expected a JWT with three segments.');
  }
  return [header, payload, signature];
}
