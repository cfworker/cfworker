import { dereference, Schema } from '../src/index.js';

let lookup: Record<string, Schema> | undefined;

export async function loadMeta() {
  if (lookup) {
    return lookup;
  }
  lookup = Object.create({});
  const ids = [
    'http://json-schema.org/draft-04/schema',
    'http://json-schema.org/draft-07/schema',
    'https://json-schema.org/draft/2019-09/schema',
    'https://json-schema.org/draft/2019-09/meta/core',
    'https://json-schema.org/draft/2019-09/meta/applicator',
    'https://json-schema.org/draft/2019-09/meta/validation',
    'https://json-schema.org/draft/2019-09/meta/meta-data',
    'https://json-schema.org/draft/2019-09/meta/format',
    'https://json-schema.org/draft/2019-09/meta/content'
  ];

  await Promise.all(
    ids.map(async id => {
      const response = await fetch(id);
      const schema = await response.json();
      dereference(schema, lookup);
    })
  );

  Object.freeze(lookup);

  return lookup;
}
