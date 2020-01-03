import { Application } from '@cfworker/web';
import { Router } from '@cfworker/web-router';

const router = new Router();

let message = 'Hello world!';

router
  .get('/', ({ res }) => {
    res.headers.set('content-type', 'text/html');
    // Caution: message should be escaped to avoid an HTML injection vulnerability.
    res.body = `
      <h1>${message} at ${new Date().toLocaleTimeString()}</h1>
      <form action="/api/message" method="POST">
        <label>
            Message
            <input name="message" value="${message}">
        </label>
        <button type="submit">Submit</button>
      </form>
      <p><a href="/api/message"><code>/api/message</code></a></p>`;
  })
  .get('/api/message', ({ res }) => {
    res.headers.set('content-type', 'application/json');
    res.body = JSON.stringify({ message });
  })
  .post('/api/message', async ({ req, res }) => {
    const data = await req.formData();
    message = data.get('message').toString();
    res.redirect('/');
  });

const app = new Application();
app.use(router.middleware);
app.listen();
