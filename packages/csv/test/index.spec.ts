import { expect } from 'chai';
import { describe, it } from 'mocha';
import { encode } from '../src/index.js';

describe('csv', () => {
  describe('encode', () => {
    it('encodes empty array', async () => {
      expect(await encodeToString([])).to.equal('');
    });

    it('encodes single column', async () => {
      expect(await encodeToString([{ hello: 'world' }])).to.equal(
        'hello\r\nworld'
      );
    });

    it('encodes multiple columns', async () => {
      expect(await encodeToString([{ hello: 'world', foo: 'bar' }])).to.equal(
        'hello,foo\r\nworld,bar'
      );
    });

    it('encodes multiple rows', async () => {
      expect(
        await encodeToString([
          { hello: 'world', foo: 'bar' },
          { hello: 'world 2', foo: 'bar 2' }
        ])
      ).to.equal('hello,foo\r\nworld,bar\r\nworld 2,bar 2');
    });

    it('encodes fields with quotes', async () => {
      expect(
        await encodeToString([{ hello: 'wo"rld"', foo: '"bar' }])
      ).to.equal('hello,foo\r\n"wo""rld""","""bar"');
    });

    it('encodes headers with quotes', async () => {
      expect(
        await encodeToString([{ [`"hello`]: 'world', [`fo"o`]: 'bar' }])
      ).to.equal('"""hello","fo""o"\r\nworld,bar');
    });

    it('encodes fields with commas', async () => {
      expect(await encodeToString([{ hello: 'wo,rld' }])).to.equal(
        'hello\r\n"wo,rld"'
      );
    });

    it('encodes fields with carriage returns and new lines', async () => {
      expect(await encodeToString([{ hello: 'wo\nrl\rd\r\n' }])).to.equal(
        'hello\r\n"wo\nrl\rd\r\n"'
      );
    });
  });
});

function encodeToString(rows: any[]) {
  return new Response(encode(rows)).text();
}
