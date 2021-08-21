# @cfworker/json-schema

![](https://badgen.net/bundlephobia/minzip/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/min/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/json-schema)
![](https://badgen.net/npm/types/@cfworker/json-schema?icon=typescript)

A JSON schema validator that will run on Cloudflare workers. Supports drafts 4, 7, 2019-09, and 2020-12.

## background

_Why another JSON schema validator?_

Cloudflare workers do not have APIs required by [Ajv](https://ajv.js.org/) schema compilation (`eval` or `new Function(code)`).
If possible use Ajv in a build step to precompile your schema. Otherwise use this library.

## basic usage

```js
import { Validator } from '@cfworker/json-schema';

const validator = new Validator({ type: 'number' });

const result = validator.validate(7);
```

## specify meta schema draft

```js
const validator = new Validator({ type: 'number' }, '4'); // draft-4
```

## add schemas

```js
const validator = new Validator({
  $id: 'https://foo.bar/baz',
  $ref: '/beep'
});

validator.addSchema({ $id: 'https://foo.bar/beep', type: 'boolean' });
```

## include all errors

By default the validator stops processing after the first error. Set the `shortCircuit` parameter to `false` to emit all errors.

```js
const shortCircuit = false;

const draft = '2019-09';

const schema = {
  type: 'object',
  required: ['name', 'email', 'number', 'bool'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    number: { type: 'number' },
    bool: { type: 'boolean' }
  }
};

const validator = new Validator(schema, draft, shortCircuit);

const result = validator.validate({
  name: 'hello',
  email: 5, // invalid type
  number: 'Hello' // invalid type
  bool: 'false' // invalid type
});
```
