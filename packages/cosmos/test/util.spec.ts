import { expect } from 'chai';
import { describe, it } from 'mocha';
import { assertArg, escapeNonASCII } from '../src/index';

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
});
