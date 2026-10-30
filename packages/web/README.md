# @cfworker/web

![](https://badgen.net/bundlephobia/minzip/@cfworker/web)
![](https://badgen.net/bundlephobia/min/@cfworker/web)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/web)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/web)
![](https://badgen.net/npm/types/@cfworker/web?icon=typescript)

Web framework for Cloudflare Workers and service workers, inspired by Koa and fastify.

```ts
import {
  Application,
  Middleware,
  Router,
  validate,
  normalizePathnameMiddleware
} from '@cfworker/web';

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
new Application()
  .use(normalizePathnameMiddleware)
  .use(cors)
  .use(router.middleware)
  .listen();
```

## Repeated validation values

By default, `validate` converts headers, query parameters, and form fields into
objects before applying their schemas. A value that occurs once is stored
directly. Repeated values are stored as an array in encounter order, including
empty values:

```ts
// ?tag=a&tag=&tag=b
const query = { tag: ['a', '', 'b'] };
```

For query parameters and URL-encoded forms, values are strings. Multipart form
values can also be `File` objects. `Headers` supplies normalized values and
usually combines repeated header lines into one string before validation.

The array shape makes a scalar schema reject duplicate query parameters or form
fields rather than validating a different value from the one application code
might read. To accept both single and repeated values, declare both shapes
explicitly:

```ts
validate({
  search: {
    properties: {
      tag: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ]
      }
    }
  }
});
```

A custom `RequestParser` continues to receive the original `URLSearchParams` or
`FormData` input and controls its resulting shape.

[To run this example](/packages/examples/web/index.ts):

```
git clone https://github.com/cfworker/cfworker
cd cfworker
npm install
npm run start-web --workspace=@cfworker/examples
```
