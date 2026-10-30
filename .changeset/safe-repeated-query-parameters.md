---
'@cfworker/web': major
---

Preserve repeated query parameters and form fields as ordered arrays during
validation. Scalar schemas now reject duplicate keys instead of validating only
the last value while handlers may consume the first. Headers use the same safe
conversion after their values are normalized, and custom parser behavior is
unchanged.
