# @cfworker/web

## 6.1.0

### Minor Changes

- 231d4d1: Export the duplicate-preserving `parseEntries` utility and its `ParsedEntries`
  return type.

## 6.0.0

### Major Changes

- f64729e: Preserve repeated query parameters and form fields as ordered arrays during
  validation. Scalar schemas now reject duplicate keys instead of validating only
  the last value while handlers may consume the first. Headers use the same safe
  conversion after their values are normalized, and custom parser behavior is
  unchanged.

### Patch Changes

- Updated dependencies [2ec889d]
  - @cfworker/json-schema@4.1.4

## 5.1.1

### Patch Changes

- 48962e9: Modernize the build and test toolchain for Node.js 26 and TypeScript 7. Packages
  are now checked with stricter optional-property and indexed-access rules, and
  library builds produce both ESM and CommonJS output through tshy.

  Refresh runtime dependencies and harden dynamic input handling. This includes
  migrating Web's safe JSON parsing to `@hapi/bourne`, adopting cookie 2,
  rejecting malformed JWT structures and unsupported verification algorithms,
  storing JWKS keys in prototype-safe maps, rejecting undersized UUID byte
  arrays, avoiding shared UUID fallback state, and making schema, routing, and
  session lookups safer.

- Updated dependencies [4dbbcbc]
- Updated dependencies [72d2f31]
- Updated dependencies [48962e9]
  - @cfworker/json-schema@4.1.3

## 5.1.0

### Minor Changes

- 7f3d122: Update HttpError to accept custom headers init

## 5.0.6

### Patch Changes

- 4379518: Update dependencies
- Updated dependencies [4379518]
  - @cfworker/json-schema@4.1.1

## 5.0.5

### Patch Changes

- 0d2124e: Don't log console error for HttpError instances

## 5.0.4

### Patch Changes

- 359f03d: Support status codes with empty body in HttpError

## 5.0.3

### Patch Changes

- 04a079e: Update dependencies
- Updated dependencies [04a079e]
  - @cfworker/json-schema@4.0.3

## 5.0.2

### Patch Changes

- b7b602d: Use tshy: Hybrid (CommonJS/ESM) TypeScript node package builder, to produce builds
- Updated dependencies [b7b602d]
  - @cfworker/json-schema@4.0.2

## 5.0.1

### Patch Changes

- a72875c: Restore type:module
- Updated dependencies [a72875c]
  - @cfworker/json-schema@4.0.1

## 5.0.0

### Major Changes

- c6e2d7b: Remove package.type for better compatibility with esm and cjs

### Patch Changes

- Updated dependencies [c6e2d7b]
  - @cfworker/json-schema@4.0.0

## 4.0.1

### Patch Changes

- c845342: Downgrade path-to-regexp

## 4.0.0

### Major Changes

- e4f2167: Update dependencies

### Patch Changes

- Updated dependencies [e4f2167]
  - @cfworker/json-schema@3.0.1

## 3.0.0

### Major Changes

- f7c148d: Add support for CommonJS by adding exports field to all packages. Thanks @dannyball710 !!

### Patch Changes

- Updated dependencies [f7c148d]
  - @cfworker/json-schema@3.0.0

## 2.1.0

### Minor Changes

- 8b0e94b: Set package type to module

### Patch Changes

- 93a12c7: Don't include tsconfig.json in package #237 #261
- Updated dependencies [93a12c7]
  - @cfworker/json-schema@2.0.1

## 2.0.0

### Major Changes

- 805c92f: Update all dependencies, use latest workers-types, deprecate cfworker dev in favor of wrangler

### Patch Changes

- Updated dependencies [805c92f]
  - @cfworker/json-schema@2.0.0

## 1.14.0

### Minor Changes

- 021999e: Rename Context.env to Context.environmentBindings

## 1.13.0

### Minor Changes

- 45cf29f: support for ESModule based workers

### Patch Changes

- Updated dependencies [576072a]
  - @cfworker/json-schema@1.12.6

## 1.12.5

### Patch Changes

- fc4c040: Update dependencies
- Updated dependencies [fc4c040]
  - @cfworker/json-schema@1.12.5
  - @cfworker/worker-types@1.12.3

## 1.12.4

### Patch Changes

- 1748ed6: Update dependencies
- Updated dependencies [1748ed6]
  - @cfworker/json-schema@1.12.4
  - @cfworker/worker-types@1.12.2

## 1.12.3

### Patch Changes

- 0db8cb1: Make router's resolve method public

## 1.12.2

### Patch Changes

- 8a6a815: Upgrade to node 16.14.0
- Updated dependencies [8a6a815]
  - @cfworker/json-schema@1.12.2

## 1.12.1

### Patch Changes

- d2390db: Update dependencies
- Updated dependencies [d2390db]
  - @cfworker/json-schema@1.12.1
  - @cfworker/worker-types@1.12.1

## 1.12.0

### Minor Changes

- 5ed7223: Downgrade @cloudflare/workers-types to 2.2.2

### Patch Changes

- Updated dependencies [5ed7223]
  - @cfworker/json-schema@1.12.0
  - @cfworker/worker-types@1.12.0

## 1.11.0

### Minor Changes

- 122dcd9: Update @cloudflare/workers-types to 3.2.x and TypeScript to 4.5.x

### Patch Changes

- Updated dependencies [122dcd9]
  - @cfworker/json-schema@1.11.0
  - @cfworker/worker-types@1.11.0

## 1.10.2

### Patch Changes

- 390ce91: Update Typescript to 4.5.2
- Updated dependencies [390ce91]
  - @cfworker/json-schema@1.10.2
  - @cfworker/worker-types@1.10.2
