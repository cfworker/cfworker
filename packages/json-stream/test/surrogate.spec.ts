import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  it('parse surrogate pair', () => {
    let i = 0;
    const p = new Parser();
    p.onValue = value => {
      expect(value).to.equal('😋');
      i++;
    };
    p.write('"\\uD83D\\uDE0B"');
    expect(i).to.equal(1);
  });

  it('parse chunked surrogate pair', () => {
    let i = 0;
    const p = new Parser();
    p.onValue = value => {
      expect(value).to.equal('😋');
      i++;
    };
    p.write('"\\uD83D');
    p.write('\\uDE0B"');
    expect(i).to.equal(1);
  });
});
