import { expect } from 'chai';
import { describe, it } from 'mocha';
import { parseUuid, uuid } from '../src/index.js';

describe('uuid', () => {
  it('generates a uuid', () => {
    const value = uuid();
    expect(value).to.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('parses a uuid', () => {
    const value = parseUuid('76a65416-a8ae-4eae-94ca-7dd75823a9ea');

    expect(value).to.eql(
      new Uint8Array([
        118,
        166,
        84,
        22,
        168,
        174,
        78,
        174,
        148,
        202,
        125,
        215,
        88,
        35,
        169,
        234
      ])
    );
  });
});
