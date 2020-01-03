# @cfworker/web-router

A router for Cloudflare Workers or service workers using [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).

```ts
import { Application } from '@cfworker/web';
import { Router } from '@cfworker/web-router';

const database = new Map<string, string>();
database.set('default-message', 'Greetings earthling.');
database.set('hello-world', 'Hello world!');

const router = new Router();

router
  .get('/:id?', ({ res, state }) => {
    const id = state.params.id;
    if (!id) {
      res.redirect('/default-message');
      return;
    }
    const message = database.get(id) || '';

    res.headers.set('content-type', 'text/html');
    res.body = `
      <h1>${new Date().toLocaleTimeString()}: "${message}"</h1>
      <form action="/api/messages/${id}" method="POST">
        <label>
            Message
            <input name="message" value="${message}">
        </label>
        <button type="submit">Submit</button>
      </form>
      <p><a href="/api/messages/${id}">/api/messages/${id}</a></p>
      <p><a href="/hello-world">/hello-world</a></p>`;
  })
  .get('/api/messages/:id', ({ res, state }) => {
    const id = state.params.id;
    if (database.has(id)) {
      const message = database.get(id);
      res.headers.set('content-type', 'application/json');
      res.body = JSON.stringify({ message });
    } else {
      res.status = 404;
      res.body = `Message with id "${id}" does not exist.`;
    }
  })
  .post('/api/messages/:id', async ({ req, res, state }) => {
    const id = state.params.id;
    const data = await req.formData();
    const message = data.get('message').toString();
    database.set(id, message);
    res.redirect(`/${id}`);
  });

const app = new Application();
app.use(router.middleware);
app.listen();
```

[To run this example](/packages/web-router/examples/worker.ts):

```
git clone https://github.com/cfworker/cfworker
cd cfworker
yarn install
yarn workspace @cfworker/web-router cfworker run examples/worker.ts --watch --nocheck
```
