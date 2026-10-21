---
'@cfworker/json-schema': patch
---

Correct `multipleOf` validation for signed decimals and small nonmultiples using
exact decimal coefficients instead of a fixed tolerance. Near-multiples such as
`0.30000000000000004` with `multipleOf: 0.1` are rejected.

Only invoke own format handlers, so unknown names such as `__proto__` are ignored
while known and explicitly registered custom formats remain enforced.
