---
'@cfworker/json-schema': patch
'@cfworker/cosmos': patch
'@cfworker/sentry': patch
'@cfworker/uuid': patch
'@cfworker/csv': patch
'@cfworker/jwt': patch
'@cfworker/web': patch
---

Modernize the build and test toolchain for Node.js 26 and TypeScript 7. Packages
are now checked with stricter optional-property and indexed-access rules, and
library builds produce both ESM and CommonJS output through tshy.

Refresh runtime dependencies and harden dynamic input handling. This includes
migrating Web's safe JSON parsing to `@hapi/bourne`, adopting cookie 2,
rejecting malformed JWT structures and unsupported verification algorithms,
storing JWKS keys in prototype-safe maps, rejecting undersized UUID byte
arrays, avoiding shared UUID fallback state, and making schema, routing, and
session lookups safer.
