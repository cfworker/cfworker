import { expect } from 'chai';
import { describe, it } from 'mocha';
import { uuid } from '../src/index';

describe('uuid', () => {
  it('generates a uuid', () => {
    const value = uuid();
    expect(value).to.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('supports custom separator', () => {
    const value = uuid('X');
    expect(value).to.match(
      /^[0-9a-f]{8}X[0-9a-f]{4}X[0-9a-f]{4}X[0-9a-f]{4}X[0-9a-f]{12}$/
    );
  });

  it('supports blank separator', () => {
    const value = uuid('');
    expect(value).to.match(
      /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/
    );
  });
});
