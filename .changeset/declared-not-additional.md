---
'@cfworker/json-schema': patch
---

A declared property (or one matching `patternProperties`) that fails its own schema is no longer also reported by `additionalProperties`. Fixes #336.
