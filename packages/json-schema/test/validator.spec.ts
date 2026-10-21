import { expect } from 'chai';
import { format } from '../src/format.js';
import type { SchemaDraft } from '../src/types.js';
import { Validator } from '../src/validator.js';

describe('Validator', () => {
  it('ignores an unknown format named __proto__', () => {
    const validator = new Validator({ type: 'string', format: '__proto__' });

    expect(validator.validate('ordinary').valid).to.equal(true);
  });

  it('rejects a normalized default that is not an integer multiple', () => {
    const validator = new Validator({
      type: 'object',
      properties: {
        value: { type: 'number', multipleOf: 1, default: 1e-8 }
      },
      required: ['value']
    });

    // A caller may have filled this default before validating; default is an annotation here.
    expect(validator.validate({ value: 1e-8 }).valid).to.equal(false);
  });

  it('accepts negative fractional multiples', () => {
    const validator = new Validator({ multipleOf: 0.1 });

    expect(validator.validate(-0.3).valid).to.equal(true);
  });

  const drafts: SchemaDraft[] = ['4', '7', '2019-09', '2020-12'];
  for (const draft of drafts) {
    describe(`decimal multipleOf (${draft})`, () => {
      const cases: [number, number, boolean][] = [
        [-0.3, 0.1, true],
        [0.3, 0.1, true],
        [-1.234, 0.001, true],
        [-0.0015, 0.001, false],
        [0, 0.1, true],
        [-0, 0.1, true],
        [1e-8, 1, false],
        [-1e-8, 1, false],
        [1e-8, 1e-8, true],
        [0.30000000000000004, 0.1, false],
        [0.9999999999999999, 1, false],
        [0.0075, 0.0001, true],
        [0.00751, 0.0001, false],
        [9007199254740991, 2, false],
        [9007199254740992, 2, true],
        [1e308, 0.123456789, false],
        [1e308, 1e-308, true],
        [5e-324, 1, false],
        [5e-324, 5e-324, true]
      ];
      for (const [instance, multipleOf, valid] of cases) {
        it(`${instance} is ${valid ? '' : 'not '}a multiple of ${multipleOf}`, () => {
          const result = new Validator({ multipleOf }, draft).validate(
            instance
          );
          expect(result.valid).to.equal(valid);
          if (!valid) expect(result.errors[0].keyword).to.equal('multipleOf');
        });
      }

      it('checks a normalized non-integral default inside compositions', () => {
        const validator = new Validator(
          {
            type: 'object',
            properties: {
              value: {
                allOf: [{ anyOf: [{ multipleOf: 1 }, { type: 'null' }] }]
              }
            },
            required: ['value']
          },
          draft
        );
        expect(validator.validate({ value: 1e-8 }).valid).to.equal(false);
        expect(validator.validate({ value: 20 }).valid).to.equal(true);
      });

      for (const name of [
        '__proto__',
        'constructor',
        'hasOwnProperty',
        'not-a-format'
      ]) {
        it(`ignores unknown format ${name} without bypassing other assertions`, () => {
          const validator = new Validator(
            { type: 'string', format: name, minLength: 2 },
            draft
          );
          expect(validator.validate('ordinary').valid).to.equal(true);
          expect(validator.validate('').valid).to.equal(false);
        });
      }

      it('keeps integer checks strict for normalized defaults', () => {
        const validator = new Validator(
          { type: 'integer', multipleOf: 1 },
          draft
        );
        expect(validator.validate(1e-8).valid).to.equal(false);
        expect(validator.validate(20).valid).to.equal(true);
      });

      it('keeps built-in formats enforced', () => {
        const validator = new Validator(
          { type: 'string', format: 'email' },
          draft
        );
        expect(validator.validate('person@example.com').valid).to.equal(true);
        expect(validator.validate('ordinary').valid).to.equal(false);
      });
    });
  }

  it('keeps explicitly registered own formats enforced', () => {
    format['test-custom-format'] = value => value === 'valid';
    try {
      const validator = new Validator({
        type: 'string',
        format: 'test-custom-format'
      });
      expect(validator.validate('valid').valid).to.equal(true);
      expect(validator.validate('invalid').valid).to.equal(false);
    } finally {
      delete format['test-custom-format'];
    }
  });

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
