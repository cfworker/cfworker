# @cfworker/web

Web framework for Cloudflare Workers and service workers, inspired by Koa and fastify.

```ts
import { Application, Middleware, Router, validate } from '@cfworker/web';

const router = new Router();

// Add the homepage route.
router.get('/', ({ res }) => {
  res.body = `
    <h1>@cfworker/web demo</h1>
    <h2 id="example-routes">Example routes</h2>
    <ol aria-labelledby="example-routes">
      <li><a href="/greetings/hello">A valid greeting</a></li>
      <li><a href="/greetings/hell">An invalid greeting</a></li>
      <li><a href="/error">A route with a bug</a></li>
    </ol>
    <img src="favicon.ico" alt="cfworker logo">`;
});

// Add a greeting route with validation.
router.get(
  '/greetings/:greeting',
  validate({
    params: {
      required: ['greeting'],
      properties: {
        greeting: {
          minLength: 5,
          maxLength: 10
        }
      }
    }
  }),
  ({ req, res }) => {
    res.body = req.params;
  }
);

// Add a route to demonstrate exception handling.
router.get('/error', () => {
  // @ts-ignore - this route has a bug!
  req.this.method.does.not.exist();
});

// Favicon route for fun :)
router.get('/favicon.ico', ({ res }) => {
  res.type = 'image/svg+xml';
  res.body = `
      <svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="200" height="200">
        <rect width="100%" height="100%" fill="#F38020"/>
        <text font-size="120" font-family="Arial, Helvetica, sans-serif" text-anchor="end" fill="#FFF" x="185" y="185">W</text>
      </svg>`;
});

// Simple CORS middleware.
const cors: Middleware = async ({ res }, next) => {
  res.headers.set('access-control-allow-origin', '*');
  await next();
};

// Compose the application
new Application().use(cors).use(router.middleware).listen();
```

[To run this example](/packages/web/examples/worker.ts):

```
git clone https://github.com/cfworker/cfworker
cd cfworker
yarn install
yarn workspace @cfworker/web cfworker run examples/worker.ts --watch --nocheck
```
