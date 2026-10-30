---
'@cfworker/json-schema': patch
---

Fix JSON Schema conformance for `contains` bounds, fractional `multipleOf`
values, prototype-named properties, array/object equality, and
`dependentRequired` schema traversal. Fixes #338.
