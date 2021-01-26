import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  it('can handle large tokens without running out of memory', function (done) {
    this.timeout(5000);

    const parser = new Parser();
    const chunkSize = 1024;
    const chunks = 1024 * 200; // 200mb
    const quote = new TextEncoder().encode('"');

    parser.onToken = function (_, value) {
      expect(value.length).to.equal(
        chunkSize * chunks,
        'token should be size of input json'
      );
      done();
    };

    parser.write(quote);
    for (var i = 0; i < chunks; ++i) {
      const buf = new Uint8Array(chunkSize);
      buf.fill(97);
      parser.write(buf);
    }
    parser.write(quote);
  });
});
