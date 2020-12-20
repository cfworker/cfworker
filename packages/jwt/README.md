# cfworker/jwt

Tiny lib for decoding JWTs and verifying signatures, using native crypto APIs.

Currently supports `alg:'RS256'` only.

## Usage

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

> If your auth provider do not publish standard jwks , you can convert public key to jwks and pass it as an additional parameter.

```js
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...';
const keySet = { keys: [{ kid: 'abc', n: 'q1rk8w...' }] };

await parseJwt(jwt, iss, aud, keySet);
```
