import { expect } from 'chai';
import { describe, it } from 'mocha';
import { decode, encode } from '../src/index';

describe('base64url', () => {
  const asciiPlain = 'The quick brown fox jumps over the lazy dog.';
  const asciiEncoded =
    'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4';
  const unicodePlain = 'foo𝌆bar';
  const unicodeEncoded = 'Zm9v8J2MhmJhcg';

  describe('encode', () => {
    it('encodes ASCII strings', () => {
      expect(encode(asciiPlain)).to.equal(asciiEncoded);
    });

    it('encodes unicode strings', () => {
      expect(encode(unicodePlain)).to.equal(unicodeEncoded);
    });
  });

  describe('decode', () => {
    it('decodes ASCII strings', () => {
      expect(decode(asciiEncoded)).to.equal(asciiPlain);
    });

    it('decodes unicode strings', () => {
      expect(decode(unicodeEncoded)).to.equal(unicodePlain);
    });
  });
});
