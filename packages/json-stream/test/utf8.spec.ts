import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  it('3 bytes of utf8', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('├──');
      i++;
    };

    p.write('"├──"');
    expect(i).to.equal(1);
  });

  it('utf8 snowman', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('☃');
      i++;
    };

    p.write('"☃"');
    expect(i).to.equal(1);
  });

  it('utf8 with regular ascii', () => {
    const p = new Parser();

    const expected: any[] = ['snow: ☃!', 'xyz', '¡que!'];
    expected.push(expected.slice());

    let i = 0;
    p.onValue = value => {
      expect(value).to.eql(expected.shift());
      i++;
    };

    p.write('["snow: ☃!","xyz","¡que!"]');
    expect(i).to.equal(4);
  });
});
