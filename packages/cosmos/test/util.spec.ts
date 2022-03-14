import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  assertArg,
  escapeNonASCII,
  parseConnectionString
} from '../src/index.js';

describe('util', () => {
  describe('escapeNonASCII', () => {
    it('preserves ASCII strings', () => {
      expect(escapeNonASCII('abc')).to.equal('abc');
    });

    it('escapes non-ASCII strings', () => {
      expect(escapeNonASCII('🤠🤠🤠')).to.equal(
        '\\ud83e\\udd20\\ud83e\\udd20\\ud83e\\udd20'
      );
    });
  });

  describe('assertArg', () => {
    it('throws when value is undefined', () => {
      expect(() => assertArg('foo', undefined)).to.throw();
    });

    it('does not throw when value is defined', () => {
      expect(() => assertArg('foo', 'bar')).not.to.throw();
    });
  });

  describe('parseConnectionString', () => {
    it('parses a connection string', () => {
      expect(
        parseConnectionString(
          'AccountEndpoint=https://foo.documents.azure.com:443/;AccountKey=hello-world;'
        )
      ).to.equal({
        AccountEndpoint: 'https://foo.documents.azure.com:443/',
        AccountKey: 'hello-world'
      });
    });

    it('throws when value is invalid', () => {
      expect(() => parseConnectionString('foo')).to.throw();
    });
  });
});
