# @cfworker/csv

Streaming CSV encoding for Cloudflare Workers and service workers.

No dependencies.

## usage

```js
import { encode } from '@cfworker/csv';

const data = [{ hello: 'world' }];

const stream = encode(data); // hello\nworld
```
