import { expect } from 'chai';
import { EncodeOptions } from '../src/encode.js';
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

    it('quotes string fields that are entirely numeric', async () => {
      expect(await encodeToString([{ hello: '01' }])).to.equal('hello\r\n"01"');
      expect(await encodeToString([{ hello: '11' }])).to.equal('hello\r\n"11"');
      expect(await encodeToString([{ hello: '1a' }])).to.equal('hello\r\n1a');
      expect(await encodeToString([{ hello: 'a1' }])).to.equal('hello\r\na1');
    });

    it('encodes custom column formats', async () => {
      expect(
        await encodeToString([{ hello: 'world', foo: 'bar', baz: 'Beep' }], {
          columns: [
            { key: 'hello', label: 'Hello', format: x => x },
            { key: 'foo', label: 'Foo', format: (x, r) => x + r.hello }
          ]
        })
      ).to.equal('Hello,Foo\r\nworld,barworld');
    });
  });
});

function encodeToString<T extends {}>(rows: T[], options?: EncodeOptions<T>) {
  return new Response(encode(rows, options)).text();
}
