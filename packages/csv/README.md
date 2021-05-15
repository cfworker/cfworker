# @cfworker/csv

![](https://badgen.net/bundlephobia/minzip/@cfworker/csv)
![](https://badgen.net/bundlephobia/min/@cfworker/csv)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/csv)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/csv)
![](https://badgen.net/npm/types/@cfworker/csv?icon=typescript)

Streaming CSV encoding for Cloudflare Workers and service workers.

## usage

```js
import { encode } from '@cfworker/csv';

const data = [{ hello: 'world' }];

const stream = encode(data); // hello\nworld
```
