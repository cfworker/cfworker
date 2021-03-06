import { decode } from '@cfworker/base64url';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { decodeJwt } from '../src/decode.js';

describe('decodeJwt', () => {
  const encoded =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const [rawHeader, rawPayload, rawSignature] = encoded.split('.');

  const encodedUndefinedType =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.GuoUe6tw79bJlbU1HU0ADX0pr0u2kf3r_4OdrDufSfQ';
  const [
    rawHeaderUndefinedType,
    rawPayloadUndefinedType,
    rawSignatureUndefinedType
  ] = encodedUndefinedType.split('.');

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
      signature: decode(rawSignature),
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
      signature: decode(rawSignatureUndefinedType),
      raw: {
        header: rawHeaderUndefinedType,
        payload: rawPayloadUndefinedType,
        signature: rawSignatureUndefinedType
      }
    });
  });
});
