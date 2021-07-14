import { expect } from 'chai';
import { describe } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  it('invalid', () => {
    let i = 0;
    const p = new Parser();
    p.onError = () => {
      i++;
    };
    p.write('{"test": eer[');
    expect(i).to.equal(1);
  });
});
