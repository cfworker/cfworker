# cfworker/jwt

Tiny lib for decoding JWTs and verifying signatures, using native crypto APIs.

Currently supports `alg:'RS256'` only.

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
