import { expect } from 'chai';
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

  it('does not report a declared property that fails its own schema as additional', () => {
    const validator = new Validator(
      {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['To-Do', 'Doing', 'Review'] }
        },
        patternProperties: { '^x-': { type: 'string' } },
        additionalProperties: false
      },
      '2020-12',
      false
    );

    const res = validator.validate({ status: 123, 'x-note': 1, extra: true });
    expect(res.valid).to.equal(false);
    expect(
      res.errors
        .filter(e => e.keyword === 'additionalProperties')
        .map(e => e.error)
    ).to.deep.equal([
      'Property "extra" does not match additional properties schema.'
    ]);
  });

  it('still leaves a declared property that fails its own schema unevaluated', () => {
    const validator = new Validator(
      {
        type: 'object',
        allOf: [{ properties: { status: { type: 'string' } } }],
        unevaluatedProperties: false
      },
      '2020-12',
      false
    );

    const res = validator.validate({ status: 123 });
    expect(res.valid).to.equal(false);
    expect(
      res.errors.some(e => e.keyword === 'unevaluatedProperties')
    ).to.equal(true);
  });

  describe('issue #338 regressions', () => {
    it('defaults minContains to one when maxContains is present', () => {
      const validator = new Validator(
        { contains: { const: 'urgent' }, maxContains: 1 },
        '2020-12'
      );

      expect(validator.validate(['normal']).valid).to.equal(false);
    });

    it('rejects a fractional non-multiple smaller than the old tolerance', () => {
      const validator = new Validator({ multipleOf: 1e-7 }, '2020-12');

      expect(validator.validate(1.5e-7).valid).to.equal(false);
    });

    it('requires an own object property', () => {
      const validator = new Validator(
        { type: 'object', required: ['constructor'] },
        '2020-12'
      );

      expect(validator.validate({}).valid).to.equal(false);
    });

    it('only applies dependentRequired for an own object property', () => {
      const validator = new Validator(
        { dependentRequired: { constructor: ['name'] } },
        '2020-12'
      );

      expect(validator.validate({}).valid).to.equal(true);
    });

    it('does not consider arrays and objects equal for const', () => {
      expect(
        new Validator({ const: [] }, '2020-12').validate({}).valid
      ).to.equal(false);
      expect(
        new Validator({ const: [1] }, '2020-12').validate({ '0': 1 }).valid
      ).to.equal(false);
    });

    it('considers an empty array and an empty object unique', () => {
      const validator = new Validator({ uniqueItems: true }, '2020-12');

      expect(validator.validate([[], {}]).valid).to.equal(true);
    });

    it('does not interpret dependentRequired entries as subschemas', () => {
      const schemas = [
        { dependentRequired: { id: [] } },
        { dependentRequired: { $id: ['#'] } }
      ];

      for (const schema of schemas) {
        expect(() => new Validator(schema, '2020-12')).not.to.throw();
      }
    });
  });
});
