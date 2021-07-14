import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Parser } from '../src/parser.js';

describe('Parser', () => {
  it("2 byte utf8 'De' character: д", () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('д');
      i++;
    };

    const de_buffer = new Uint8Array([0xd0, 0xb4]);

    p.write('"');
    p.write(de_buffer);
    p.write('"');
    expect(i).to.equal(1);
  });

  it("3 byte utf8 'Han' character: 我", () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('我');
      i++;
    };

    const han_buffer = new Uint8Array([0xe6, 0x88, 0x91]);
    p.write('"');
    p.write(han_buffer);
    p.write('"');
    expect(i).to.equal(1);
  });

  it('4 byte utf8 character (unicode scalar U+2070E): 𠜎', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('𠜎');
      i++;
    };

    const Ux2070E_buffer = new Uint8Array([0xf0, 0xa0, 0x9c, 0x8e]);
    p.write('"');
    p.write(Ux2070E_buffer);
    p.write('"');
    expect(i).to.equal(1);
  });

  it("3 byte utf8 'Han' character chunked inbetween 2nd and 3rd byte: 我", () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('我');
      i++;
    };

    const han_buffer_first = new Uint8Array([0xe6, 0x88]);
    const han_buffer_second = new Uint8Array([0x91]);
    p.write('"');
    p.write(han_buffer_first);
    p.write(han_buffer_second);
    p.write('"');
    expect(i).to.equal(1);
  });

  it('4 byte utf8 character (unicode scalar U+2070E) chunked inbetween 2nd and 3rd byte: 𠜎', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('𠜎');
      i++;
    };

    const Ux2070E_buffer_first = new Uint8Array([0xf0, 0xa0]);
    const Ux2070E_buffer_second = new Uint8Array([0x9c, 0x8e]);
    p.write('"');
    p.write(Ux2070E_buffer_first);
    p.write(Ux2070E_buffer_second);
    p.write('"');
    expect(i).to.equal(1);
  });

  it('1-4 byte utf8 character string chunked inbetween random bytes: Aж文𠜱B', () => {
    const p = new Parser();

    let i = 0;
    p.onValue = value => {
      expect(value).to.equal('Aж文𠜱B');
      i++;
    };

    const eclectic_buffer = new Uint8Array([
      0x41, // A
      0xd0,
      0xb6, // ж
      0xe6,
      0x96,
      0x87, // 文
      0xf0,
      0xa0,
      0x9c,
      0xb1, // 𠜱
      0x42
    ]); // B

    const rand_chunk = Math.floor(Math.random() * eclectic_buffer.length);
    const first_buffer = eclectic_buffer.slice(0, rand_chunk);
    const second_buffer = eclectic_buffer.slice(rand_chunk);

    //console.log('eclectic_buffer: ' + eclectic_buffer)
    //console.log('sliced from 0 to ' + rand_chunk);
    //console.log(first_buffer);
    //console.log('then sliced from ' + rand_chunk + ' to the end');
    //console.log(second_buffer);

    console.log('chunked after offset ' + rand_chunk);
    p.write('"');
    p.write(first_buffer);
    p.write(second_buffer);
    p.write('"');
    expect(i).to.equal(1);
  });
});
