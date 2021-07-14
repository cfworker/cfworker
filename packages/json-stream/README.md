# @cfworker/json-stream

Streaming JSON parser for Cloudflare Workers and service workers.

Ported from [jsonparse](https://github.com/creationix/jsonparse) to use Uint8Array instead of Buffer. UTF-8 slicing logic ported from the [buffer](https://github.com/feross/buffer) package.

No dependencies.

## usage

```js
import {} from '@cfworker/json-stream';
```
