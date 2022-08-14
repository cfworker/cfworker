# @cfworker/jwt

## 4.0.3

### Patch Changes

- 1748ed6: Update dependencies
- Updated dependencies [1748ed6]
  - @cfworker/worker-types@1.12.2

## 4.0.2

### Patch Changes

- 84f9f99: Remove jwks promise cache

## 4.0.1

### Patch Changes

- fabe900: Reuse jwks imports

## 4.0.0

### Major Changes

- 37df6b6: Use OIDC discovery document to locate public keyset

## 3.0.0

### Major Changes

- 073acc7: Validate iat and nbf. Permit 30 seconds of clock skew. Enable supplying custom public key resolver to parseJwt.

## 2.0.0

### Major Changes

- bc29475: Add support for RS384 and RS512

### Patch Changes

- 03090fb: Migrate from @cfworker/base64url and base64-arraybuffer to rfc4648

## 1.12.2

### Patch Changes

- 8a6a815: Upgrade to node 16.14.0
- Updated dependencies [8a6a815]
  - @cfworker/base64url@1.12.2

## 1.12.1

### Patch Changes

- d2390db: Update dependencies
- Updated dependencies [d2390db]
  - @cfworker/base64url@1.12.1
  - @cfworker/worker-types@1.12.1

## 1.12.0

### Minor Changes

- 5ed7223: Downgrade @cloudflare/workers-types to 2.2.2

### Patch Changes

- Updated dependencies [5ed7223]
  - @cfworker/base64url@1.12.0
  - @cfworker/worker-types@1.12.0

## 1.11.0

### Minor Changes

- 122dcd9: Update @cloudflare/workers-types to 3.2.x and TypeScript to 4.5.x

### Patch Changes

- Updated dependencies [122dcd9]
  - @cfworker/base64url@1.11.0
  - @cfworker/worker-types@1.11.0

## 1.10.2

### Patch Changes

- 390ce91: Update Typescript to 4.5.2
- Updated dependencies [390ce91]
  - @cfworker/base64url@1.10.2
  - @cfworker/worker-types@1.10.2
