# @cfworker/sentry

![](https://badgen.net/bundlephobia/minzip/@cfworker/sentry)
![](https://badgen.net/bundlephobia/min/@cfworker/sentry)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/sentry)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/sentry)
![](https://badgen.net/npm/types/@cfworker/sentry?icon=typescript)

Minimalist Sentry client for Cloudflare workers and service workers.

```js
import { captureError } from '@cfworker/sentry';

const sentryDsn = '...';
const environment = 'production'; // development, etc.
const release = '...';

addEventListener('fetch', event => {
  try {
    // handle event.request ...
  } catch (err) {
    const { event_id, promise } = captureError(
      sentryDsn,
      environment,
      release,
      err,
      event.request,
      user // optional, eg { name: 'octocat' }
    );
    event.waitUntil(promise);
  }

  event.respondWith(
    new Response(`Internal server error. Event ID: ${event_id}`, {
      status: 500
    })
  );
});
```
