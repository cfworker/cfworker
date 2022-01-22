import { captureError } from '@cfworker/sentry';
import {
  Application,
  htmlEncode,
  HttpError,
  Middleware,
  Router,
  validate
} from '@cfworker/web';
import { html } from './html-stream.js';

const sentryLogging: Middleware = async (context, next) => {
  const { req, state } = context;
  try {
    await next();
  } catch (err) {
    if (!(err instanceof HttpError) || err.status === 500) {
      const { posted } = captureError(
        process.env.SENTRY_DSN,
        process.env.NODE_ENV,
        'demo',
        err,
        req.raw,
        state.user
      );
      context.waitUntil(posted);
    }
    throw err;
  }
};

const notFoundPage: Middleware = async (
  { res, req: { url, accepts } },
  next
) => {
  await next();
  if (res.status === 404 && accepts.type('text/html')) {
    res.status = 404; // explicit status
    res.body = `<h1>Not Found</h1><p>Where in the world is ${htmlEncode(
      url.pathname
    )}?</p>`;
  }
};

const router = new Router();

router
  .get('/', ({ res }) => {
    res.body =
      '<h1>cfworker</h1><a href="https://github.com/cfworker/cfworker">GitHub</a>';
  })
  .get('/echo-headers', ({ req, res }) => {
    res.status = 200;
    res.body = Object.fromEntries(req.headers);
  })
  .get('/hello-world', ({ res }) => {
    res.body = 'hello world';
  })
  .get('/error-test', errorTest)
  .get('/eject', context =>
    context.respondWith(new Response('ejected', { status: 200 }))
  )
  .get(
    '/api/greetings/:greeting',
    validate({
      params: {
        required: ['greeting'],
        additionalProperties: false,
        properties: {
          greeting: {
            type: 'string',
            minLength: 5
          }
        }
      }
    }),
    ({ req, res }) => {
      res.body = req.params;
    }
  )
  .get('/stream', ({ res }) => {
    res.body = html` <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Demo</title>
        </head>

        <body>
          <h1>Demo</h1>
          <div>
            ${fetch('https://example.com').then(response => response.body)}
          </div>
        </body>
      </html>`;
  })
  .get('/favicon.ico', ({ res }) => {
    res.type = 'image/svg+xml';
    res.body = `
        <svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="200" height="200">
          <rect width="100%" height="100%" fill="#F38020"/>
          <text font-size="120" font-family="Arial, Helvetica, sans-serif" text-anchor="end" fill="#FFF" x="185" y="185">W</text>
        </svg>`;
  });

new Application()
  .use(sentryLogging)
  .use(notFoundPage)
  .use(router.middleware)
  .listen();

function errorTest() {
  function bar() {
    // @ts-ignore
    if (a.b.c.d) {
      return;
    }
  }

  function foo() {
    return bar();
  }

  return foo();
}
