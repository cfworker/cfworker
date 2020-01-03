# @cfworker/uuid

Fast UUID generator with no dependencies.
Generate V4 compliant UUIDs using crypto.getRandomValues

## usage

```js
import { uuid } from '@cfworker/uuid';

// standard uuid
const id = uuid();

// custom separator
const id2 = uuid('_');

// no separator
const id3 = uuid('');
```
