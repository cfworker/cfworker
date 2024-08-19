# cfworker

![](https://github.com/cfworker/cfworker/workflows/build/badge.svg)

A collection of packages optimized for Cloudflare Workers and service workers.

## @cfworker/cosmos

![](https://badgen.net/bundlephobia/minzip/@cfworker/cosmos)
![](https://badgen.net/bundlephobia/min/@cfworker/cosmos)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/cosmos)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/cosmos)
![](https://badgen.net/npm/types/@cfworker/cosmos?icon=typescript)

Azure Cosmos DB client for Cloudflare Workers and service workers

[readme](https://github.com/cfworker/cfworker/tree/master/packages/cosmos/README.md) | [npm](https://www.npmjs.com/package/@cfworker/cosmos)

## @cfworker/csv

![](https://badgen.net/bundlephobia/minzip/@cfworker/csv)
![](https://badgen.net/bundlephobia/min/@cfworker/csv)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/csv)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/csv)
![](https://badgen.net/npm/types/@cfworker/csv?icon=typescript)

Streaming CSV encoding for Cloudflare Workers and service workers

[readme](https://github.com/cfworker/cfworker/tree/master/packages/csv/README.md) | [npm](https://www.npmjs.com/package/@cfworker/csv)

## @cfworker/json-schema

![](https://badgen.net/bundlephobia/minzip/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/min/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/json-schema)
![](https://badgen.net/npm/types/@cfworker/json-schema?icon=typescript)

A JSON schema validator that will run on Cloudflare workers. Supports drafts 4, 7, 2019-09, and 2020-12.

[readme](https://github.com/cfworker/cfworker/tree/master/packages/json-schema/README.md) | [npm](https://www.npmjs.com/package/@cfworker/json-schema)

## @cfworker/jwt

![](https://badgen.net/bundlephobia/minzip/@cfworker/jwt)
![](https://badgen.net/bundlephobia/min/@cfworker/jwt)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/jwt)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/jwt)
![](https://badgen.net/npm/types/@cfworker/jwt?icon=typescript)

Tiny lib for decoding JWTs and verifying signatures, using native crypto APIs

[readme](https://github.com/cfworker/cfworker/tree/master/packages/jwt/README.md) | [npm](https://www.npmjs.com/package/@cfworker/jwt)

## @cfworker/sentry

![](https://badgen.net/bundlephobia/minzip/@cfworker/sentry)
![](https://badgen.net/bundlephobia/min/@cfworker/sentry)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/sentry)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/sentry)
![](https://badgen.net/npm/types/@cfworker/sentry?icon=typescript)

Minimalist Sentry client for Cloudflare workers and service workers

[readme](https://github.com/cfworker/cfworker/tree/master/packages/sentry/README.md) | [npm](https://www.npmjs.com/package/@cfworker/sentry)

## @cfworker/uuid

![](https://badgen.net/bundlephobia/minzip/@cfworker/uuid)
![](https://badgen.net/bundlephobia/min/@cfworker/uuid)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/uuid)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/uuid)
![](https://badgen.net/npm/types/@cfworker/uuid?icon=typescript)

Serialize/deserialize V4 UUIDs from a Uint8Array

[readme](https://github.com/cfworker/cfworker/tree/master/packages/uuid/README.md) | [npm](https://www.npmjs.com/package/@cfworker/uuid)

## @cfworker/web

![](https://badgen.net/bundlephobia/minzip/@cfworker/web)
![](https://badgen.net/bundlephobia/min/@cfworker/web)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/web)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/web)
![](https://badgen.net/npm/types/@cfworker/web?icon=typescript)

Web framework for Cloudflare Workers and service workers, inspired by Koa and fastify

[readme](https://github.com/cfworker/cfworker/tree/master/packages/web/README.md) | [npm](https://www.npmjs.com/package/@cfworker/web)

## contributing

Install dependencies using npm. Npm workspaces will ensure cfworker packages that depend on other cfworker packages are linked properly.

```
npm install
```

Run all tests

```
npm test
```

Run a specific package's tests

```
npm run test --workspace=@cfworker/base64url
```

Refer to each package's README for more specific instructions and examples.
Some packages require a .env file (gitignored) containing cloudflare or cosmos db keys for integration testing.
