---
'@cfworker/jwt': patch
---

Refactor parseJwt to use a single options parameter. Add an option to customize the clock skew allowance when validating iat, nbf, and exp claims. Change the default clock skew from 30 to 60 seconds. Include jwt header in parse result.
