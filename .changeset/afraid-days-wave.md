---
'@cfworker/cosmos': patch
---

Cancel retryRequest body after successful fetch. This removes the `A ReadableStream branch was created but never consumed...` error shown during debugging.