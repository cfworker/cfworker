import { expect } from 'chai';
import { describe, it } from 'mocha';
import { dereference, validate } from '../src/index.js';
import { remotes, suites } from './json-schema-test-suite.js';
import { loadMeta } from './meta-schema.js';

const unsupportedTests = {
  'draft4/optional/bignum': true,
  'draft4/optional/ecmascript-regex': true,
  'draft4/optional/zeroTerminatedFloats': true,
  'draft4/optional/non-bmp-regex': true,

  'draft7/optional/content': true,
  'draft7/optional/format/ecmascript-regex': true,
  'draft7/optional/format/idn-email': true,
  'draft7/optional/format/idn-hostname': true,
  'draft7/optional/format/iri-reference': true,
  'draft7/optional/format/iri': true,
  'draft7/optional/non-bmp-regex': true,

  'draft2019-09/optional/content': true,
  'draft2019-09/optional/format/ecmascript-regex': true,
  'draft2019-09/optional/format/idn-email': true,
  'draft2019-09/optional/format/idn-hostname': true,
  'draft2019-09/optional/format/iri-reference': true,
  'draft2019-09/optional/format/iri': true,
  'draft2019-09/optional/non-bmp-regex': true
};

const remotesLookup = Object.create(null);
for (const { name, schema } of remotes) {
  dereference(schema, remotesLookup, new URL(name));
}
Object.freeze(remotesLookup);

suites.forEach(({ draft, name, tests }) => {
  if (unsupportedTests[name]) {
    return;
  }
  describe(name, () => {
    tests.forEach(({ schema, description, tests }) => {
      const schemaLookup = dereference(schema);
      describe(description, () => {
        tests.forEach(({ data, valid, description }) => {
          it(description, async () => {
            const metaLookup = await loadMeta();
            const lookup = {
              ...metaLookup,
              ...remotesLookup,
              ...schemaLookup
            };
            const result = validate(data, schema, draft, lookup);
            expect(result.valid).to.equal(valid, description);
          });
        });
      });
    });
  });
});
