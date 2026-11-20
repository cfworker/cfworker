---
'@cfworker/json-schema': patch
---

Resolve `$anchor` and fragment `$id` of an embedded schema resource against its own `$id` only, so it no longer replaces an anchor of the enclosing resource.
