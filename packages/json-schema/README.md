# @cfworker/json-schema

A JSON schema validator that will run on Cloudflare workers. Supports drafts 4, 7, and 2019-09.

## background

_Why another JSON schema validator?_

Cloudflare workers do not have APIs required by [Ajv](https://ajv.js.org/) schema compilation (`eval` or `new Function(code)`).
If possible use Ajv in a build step to precompile your schema. Otherwise use this library.

## usage

1. Basic

   ```js
   import { Validator } from '@cfworker/json-schema';

   const validator = new Validator({ type: 'number' });

   const result = validator.validate(7);
   ```

2. Specify meta schema draft

   ```js
   const validator = new Validator({ type: 'number' }, '4'); // draft-4
   ```

3. Add schemas

   ```js
   const validator = new Validator({
     $id: 'https://foo.bar/baz',
     $ref: '/beep'
   });

   validator.addSchema({ $id: 'https://foo.bar/beep', type: 'boolean' });
   ```

4. Include all errors
   By default the validator will stop processing an object or array after the first error. Specifying shortCircuit to false will produce all errors.

   ```js
   const validator = new Validator(
     {
      type: 'object',
      required: ['name', 'email', 'number', 'bool'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        number: { type: 'number' },
        bool: { type: 'boolean' }
      }
     },
     '2019-09',
     false
   );

   const result = validator.validate({
     name: 'hello',
     email: 5, // invalid type
     number: 'Hello' // invalid type
     bool: 'false' // invalid type
   });
   ```
