import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Validator } from '../src/validator';

describe('Validator', () => {
  it('validates', () => {
    const validator = new Validator({ type: 'number' });

    expect(validator.validate(7).valid).to.equal(true);
    expect(validator.validate('hello world').valid).to.equal(false);
  });

  it('adds schema', () => {
    const validator = new Validator({
      $id: 'https://foo.bar/baz',
      $ref: '/beep'
    });

    validator.addSchema({ $id: 'https://foo.bar/beep', type: 'boolean' });

    expect(validator.validate(true).valid).to.equal(true);
    expect(validator.validate('hello world').valid).to.equal(false);
  });
});
