# @cfworker/base64url

base64 URL encoding for Cloudflare Workers and service workers.

No dependencies.

## usage

```js
import { encode, decode } from '@cfworker/base64url';

const plain = 'The quick brown fox jumps over the lazy dog.';

const encoded = encode(plain); // VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4

const decoded = decode(encoded); // The quick brown fox jumps over the lazy dog.
```
