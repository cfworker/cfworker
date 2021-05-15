# @cfworker/base64url

![](https://badgen.net/bundlephobia/minzip/@cfworker/base64url)
![](https://badgen.net/bundlephobia/min/@cfworker/base64url)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/base64url)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/base64url)
![](https://badgen.net/npm/types/@cfworker/base64url?icon=typescript)

base64 URL encoding for Cloudflare Workers and service workers.

## usage

```js
import { encode, decode } from '@cfworker/base64url';

const plain = 'The quick brown fox jumps over the lazy dog.';

const encoded = encode(plain); // VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4

const decoded = decode(encoded); // The quick brown fox jumps over the lazy dog.
```
