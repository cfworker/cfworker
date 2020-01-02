# @cfworker/uuid

Fast uuid V4 generator with no dependencies.

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
