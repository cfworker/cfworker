# cfworker

![](https://github.com/cfworker/cfworker/workflows/build/badge.svg)

A collection of packages optimized for Cloudflare Workers and service workers.

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

Refer to each package's README for more specific instructions.
Some packages require a .env file (gitignored) containing cloudflare or cosmos db keys for integration testing.
