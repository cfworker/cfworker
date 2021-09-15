# @cfworker/uuid

![](https://badgen.net/bundlephobia/minzip/@cfworker/uuid)
![](https://badgen.net/bundlephobia/min/@cfworker/uuid)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/uuid)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/uuid)
![](https://badgen.net/npm/types/@cfworker/uuid?icon=typescript)

Serialize/deserialize V4 UUIDs from a Uint8Array.

🛑 Use [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) if you only need to generate V4 UUIDs.

## usage

```js
import { uuid } from '@cfworker/uuid';

// generate a uuid (uses crypto.randomUUID())
const id = uuid();

// deserialize/serialize Uint8Array
const array: Uint8Array = parseUuid('129aa5a9-fa7b-4bed-8fb2-d88047926c6f');
const uuid = uuid(array); // '129aa5a9-fa7b-4bed-8fb2-d88047926c6f'
```
