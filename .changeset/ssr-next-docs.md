---
"focusgroup-polyfill": patch
---

Skip DOM work when `document` / `HTMLElement` are unavailable so imports are safe in Node and SSR. Document Next.js App Router usage via `instrumentation-client`.
