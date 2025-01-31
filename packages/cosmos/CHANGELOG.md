# @cfworker/cosmos

## 4.0.5

### Patch Changes

- 4379518: Update dependencies

## 4.0.4

### Patch Changes

- 04a079e: Update dependencies

## 4.0.3

### Patch Changes

- 631daf3: Cancel retryRequest body after successful fetch. This removes the `A ReadableStream branch was created but never consumed...` error shown during debugging.

## 4.0.2

### Patch Changes

- b7b602d: Use tshy: Hybrid (CommonJS/ESM) TypeScript node package builder, to produce builds

## 4.0.1

### Patch Changes

- a72875c: Restore type:module

## 4.0.0

### Major Changes

- c6e2d7b: Remove package.type for better compatibility with esm and cjs

## 3.0.1

### Patch Changes

- e4f2167: Update dependencies

## 3.0.0

### Major Changes

- f7c148d: Add support for CommonJS by adding exports field to all packages. Thanks @dannyball710 !!

## 2.1.0

### Minor Changes

- 8b0e94b: Set package type to module

### Patch Changes

- 93a12c7: Don't include tsconfig.json in package #237 #261

## 2.0.0

### Major Changes

- 805c92f: Update all dependencies, use latest workers-types, deprecate cfworker dev in favor of wrangler

## 1.13.6

### Patch Changes

- a6fead5: disable cosmos integration tests

## 1.13.5

### Patch Changes

- fc4c040: Update dependencies
- Updated dependencies [fc4c040]
  - @cfworker/worker-types@1.12.3

## 1.13.4

### Patch Changes

- 1748ed6: Update dependencies
- Updated dependencies [1748ed6]
  - @cfworker/worker-types@1.12.2

## 1.13.3

### Patch Changes

- 03090fb: Migrate from @cfworker/base64url and base64-arraybuffer to rfc4648

## 1.13.2

### Patch Changes

- cf26d3c: Fixed: "Your worker called response.clone(), but did not read the body of both clones."

## 1.13.1

### Patch Changes

- 729a6fd: Rename accountKey back to masterKey

## 1.13.0

### Minor Changes

- 07f7266: Allow authenticating with Cosmos DB using a connection string

### Patch Changes

- cd89593: Fix auth issues when Cosmos DB endpoint had trailing slash
- 9e543bf: Fix issues with running in a Node.js environment

## 1.12.2

### Patch Changes

- 8a6a815: Upgrade to node 16.14.0

## 1.12.1

### Patch Changes

- d2390db: Update dependencies
- Updated dependencies [d2390db]
  - @cfworker/worker-types@1.12.1

## 1.12.0

### Minor Changes

- 5ed7223: Downgrade @cloudflare/workers-types to 2.2.2

### Patch Changes

- Updated dependencies [5ed7223]
  - @cfworker/worker-types@1.12.0

## 1.11.0

### Minor Changes

- 122dcd9: Update @cloudflare/workers-types to 3.2.x and TypeScript to 4.5.x

### Patch Changes

- Updated dependencies [122dcd9]
  - @cfworker/worker-types@1.11.0

## 1.10.2

### Patch Changes

- 390ce91: Update Typescript to 4.5.2
- Updated dependencies [390ce91]
  - @cfworker/worker-types@1.10.2
