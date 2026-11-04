import { expect } from 'chai';
import {
  dereference,
  Schema,
  validate,
  ValidationResult
} from '../src/index.js';
import { remotes, suites } from './json-schema-test-suite.js';
import { loadMeta } from './meta-schema.js';
import { unsupportedTests } from './unsupported.js';

const remotesLookup = Object.create(null);
for (const { name, schema } of remotes) {
  dereference(schema, remotesLookup, new URL(name));
}
Object.freeze(remotesLookup);

describe('json-schema', () => {
  const failures: Record<string, Record<string, Record<string, true>>> = {};
  suites.forEach(({ draft, name, tests }) => {
    if (name.endsWith('/unknownKeyword')) {
      return;
    }
    describe(name, () => {
      tests.forEach(({ schema, description: description1, tests }) => {
        const schemaLookup = dereference(schema);
        describe(description1, () => {
          tests.forEach(({ data, valid, description: description2, debug }) => {
            if (unsupportedTests[name]?.[description1]?.[description2]) {
              return;
            }
            (debug ? it.only : it)(description2, async () => {
              if (debug) {
                debugger;
              }
              const metaLookup = await loadMeta();
              const lookup = {
                ...metaLookup,
                ...remotesLookup,
                ...schemaLookup
              };
              let result: ValidationResult | undefined = undefined;
              try {
                result = validate(data, schema, draft, lookup);
              } catch (err) {}
              if (result?.valid !== valid) {
                failures[name] = failures[name] ?? {};
                failures[name][description1] =
                  failures[name][description1] ?? {};
                failures[name][description1][description2] = true;
              }
              expect(result?.valid).to.equal(valid, description2);
            });
          });
        });
      });
    });
  });

  it('normalizes URI fragments in $ref values', () => {
    // https://github.com/cfworker/cfworker/issues/285

    const schema = {
      type: 'object',
      definitions: {
        'child[one]': { type: 'string' },
        'hash#field': { type: 'boolean' },
        'tilde~field': { type: 'integer' }
      },
      properties: {
        encoded: { $ref: '#/definitions/child%5bone%5d' },
        hash: { $ref: '#/definitions/hash%23field' },
        unreserved: { $ref: '#/definitions/tilde%7e0field' },
        unencoded: { $ref: '#/definitions/child[one]' }
      }
    } satisfies Schema;

    const input = {
      encoded: 'value',
      hash: true,
      unreserved: 1,
      unencoded: 'value'
    };

    const result = validate(input, schema);
    expect(result.valid).to.be.true;
    expect(validate({ ...input, encoded: 1 }, schema).valid).to.be.false;
  });

  // after(() => console.log(JSON.stringify(failures, null, 2)));
});
