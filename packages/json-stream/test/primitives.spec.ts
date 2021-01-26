import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  const expected = [
    [[], ''],
    [[], 'Hello'],
    [[], 'This"is'],
    [[], '\r\n\f\t\\/"'],
    [[], 'Λάμβδα'],
    [[], '\\'],
    [[], '/'],
    [[], '"'],
    [[0], 0],
    [[1], 1],
    [[2], -1],
    [[], [0, 1, -1]],
    [[0], 1],
    [[1], 1.1],
    [[2], -1.1],
    [[3], -1],
    [[], [1, 1.1, -1.1, -1]],
    [[0], -1],
    [[], [-1]],
    [[0], -0.1],
    [[], [-0.1]],
    [[0], 6.02e23],
    [[], [6.02e23]],
    [[0], '7161093205057351174'],
    [[], ['7161093205057351174']]
  ];

  it('primitives', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = function (value) {
      const keys = this.stack
        .slice(1)
        .map(function (item) {
          return item.key;
        })
        .concat(this.key !== undefined ? this.key : []);
      expect([keys, value]).to.eql(expected.shift());
      i++;
    };

    p.write('"""Hello""This\\"is""\\r\\n\\f\\t\\\\\\/\\""');
    p.write('"\\u039b\\u03ac\\u03bc\\u03b2\\u03b4\\u03b1"');
    p.write('"\\\\"');
    p.write('"\\/"');
    p.write('"\\""');
    p.write('[0,1,-1]');
    p.write('[1.0,1.1,-1.1,-1.0][-1][-0.1]');
    p.write('[6.02e23]');
    p.write('[7161093205057351174]');
    expect(i).to.equal(25);
  });
});
