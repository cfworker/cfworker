# cfworker

![](https://github.com/cfworker/cfworker/workflows/build/badge.svg)

A collection of packages optimized for Cloudflare Workers and service workers.

## packages

- `@cfworker/base64url`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/base64url/README.md) | [npm](https://www.npmjs.com/package/@cfworker/base64url)

  base64 URL encoding for Cloudflare Workers and service workers

- `@cfworker/cosmos`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/cosmos/README.md) | [npm](https://www.npmjs.com/package/@cfworker/cosmos)

  Azure Cosmos DB client for Cloudflare Workers and service workers

- `@cfworker/demo`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/demo/README.md) | [npm](https://www.npmjs.com/package/@cfworker/demo)

  Web app demo

- `@cfworker/dev`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/dev/README.md) | [npm](https://www.npmjs.com/package/@cfworker/dev)

  Run, test and deploy Cloudflare workers

- `@cfworker/json-schema`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/json-schema/README.md) | [npm](https://www.npmjs.com/package/@cfworker/json-schema)

  A JSON schema validator that will run on Cloudflare workers. Supports drafts 4, 7, and 2019-09.

- `@cfworker/jwt`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/jwt/README.md) | [npm](https://www.npmjs.com/package/@cfworker/jwt)

  Tiny lib for decoding JWTs and verifying signatures, using native crypto APIs

- `@cfworker/sentry`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/sentry/README.md) | [npm](https://www.npmjs.com/package/@cfworker/sentry)

  Minimalist Sentry client for Cloudflare workers and service workers

- `@cfworker/uuid`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/uuid/README.md) | [npm](https://www.npmjs.com/package/@cfworker/uuid)

  Fast UUID generator with no dependencies. Generate V4 compliant UUIDs using crypto.getRandomValues

- `@cfworker/web`: [readme](https://github.com/cfworker/cfworker/tree/master/packages/web/README.md) | [npm](https://www.npmjs.com/package/@cfworker/web)

  Web framework for Cloudflare Workers and service workers, inspired by Koa and fastify

## contributing

Install dependencies using yarn. Yarn will ensure cfworker packages that depend on other cfworker packages are linked properly.

```
yarn install
```

Run all tests

```
yarn test
```

Run a specific package's tests

```
yarn workspace @cfworker/base64url test
```

Watch files for changes and re-run tests

```
yarn workspace @cfworker/base64url test --watch
```

Use chrome devtools to debug tests

```
yarn workspace @cfworker/base64url test --watch --inspect
```

Refer to each package's README for more specific instructions and examples.
Some packages require a .env file (gitignored) containing cloudflare or cosmos db keys for integration testing.
