# @cfworker/http-errors

A collection HTTP error classes for use with @cfworker/web.

```js
import { BadRequestError } from '@cfworker/http-errors';

// ... while handling a request...

throw new BadRequestError('foo is required.');
```
