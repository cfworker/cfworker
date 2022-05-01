# cfworker/jwt

![](https://badgen.net/bundlephobia/minzip/@cfworker/jwt)
![](https://badgen.net/bundlephobia/min/@cfworker/jwt)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/jwt)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/jwt)
![](https://badgen.net/npm/types/@cfworker/jwt?icon=typescript)

Tiny lib for decoding JWTs and verifying signatures, using native crypto APIs.

Currently supports RS256, RS384, and RS512.

```js
const jwt = request.headers.get('Authorization');
const issuer = '...'; // Auth0 origin.
const audience = '...'; // Auth0 client id.

const result = await parseJwt(jwt, issuer, audience);
if (!result.valid) {
  console.log(result.reason); // Invalid issuer/audience, expired, etc
} else {
  console.log(result.payload); // { iss, sub, aud, iat, exp, ...claims }
}
```
