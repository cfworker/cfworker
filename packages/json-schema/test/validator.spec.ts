import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Validator } from '../src/validator.js';

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

  it('adds schema with specified id', () => {
    const validator = new Validator({
      $id: 'https://foo.bar/baz',
      $ref: '/beep'
    });

    validator.addSchema({ type: 'boolean' }, 'https://foo.bar/beep');

    expect(validator.validate(true).valid).to.equal(true);
    expect(validator.validate('hello world').valid).to.equal(false);
  });

  it('validate all array entries with nested errors', () => {
    const validator = new Validator(
      {
        type: 'array',
        items: {
          name: { type: 'string' },
          email: { type: 'string' },
          required: ['name', 'email']
        }
      },
      '2019-09',
      false
    );

    const res = validator.validate([
      {
        name: 'hello'
        //missing email
      },
      {
        //missing name
        email: 'a@b.c'
      }
    ]);
    expect(res.valid).to.equal(false);
    expect(res.errors.length).to.equal(4);
  });

  it('validate all object properties with nested errors', () => {
    const validator = new Validator(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          number: { type: 'number' },
          required: ['name', 'email', 'number']
        }
      },
      '2019-09',
      false
    );

    const res = validator.validate({
      name: 'hello',
      email: 5, //invalid type
      number: 'Hello' //invalid type
    });
    expect(res.valid).to.equal(false);
    expect(res.errors.length).to.equal(4);
  });
});
