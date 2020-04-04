import { CosmosClient, PartitionKeyDefinition } from '@cfworker/cosmos';
import {
  BadRequestError,
  HttpError,
  UnauthorizedError
} from '@cfworker/http-errors';
import { captureError } from '@cfworker/sentry';
import { Application, Middleware } from '@cfworker/web';
import { Router } from '@cfworker/web-router';
import { getManagementToken, handleRegister } from './auth/management';
import {
  auth0Origin,
  authentication,
  getAuthorizeUrl,
  handleSignout,
  handleTokenCallback
} from './auth/oauth-flow';
import { htmlEncode } from './html-encode';
import { html } from './html-stream';
import './polyfills';

const exceptionHandler: Middleware = async (context, next) => {
  const { res, req, state } = context;
  try {
    await next();
  } catch (err) {
    if (err instanceof HttpError && err.code !== 500) {
      res.status = err.code;
      res.body = err.message;
      res.headers.set('content-type', 'text/plain');
      return;
    }

    const { event_id, promise } = captureError(
      process.env.SENTRY_DSN,
      process.env.NODE_ENV,
      err,
      req,
      state.user
    );
    context.waitUntil(promise);
    let message: string;

    if (String(process.env.NODE_ENV) === 'development') {
      message = err.stack;
    } else {
      message = `Event ID: ${event_id}`;
    }
    res.status = 500;
    if (context.accepts.type('text/html')) {
      res.body = `<h1>Internal Server Error</h1><p><pre><code>${htmlEncode(
        message
      )}</code></pre></p>`;
      res.headers.set('content-type', 'text/html');
    } else {
      res.body = message;
      res.headers.set('content-type', 'text/plain');
    }
  }
};

const originAndReferrerValidation: Middleware = async (context, next) => {
  const {
    url,
    req: { method, headers }
  } = context;

  const permitted = [url.origin, auth0Origin];

  const originHeader = headers.get('origin');
  if (originHeader && !permitted.includes(originHeader)) {
    throw new BadRequestError(`Invalid origin "${originHeader}"`);
  }

  const referrerHeader = headers.get('referrer');
  if (
    referrerHeader &&
    method !== 'GET' &&
    !permitted.includes(new URL(referrerHeader).origin)
  ) {
    throw new BadRequestError(`Invalid ${method} referrer "${referrerHeader}"`);
  }

  await next();
};

const notFoundPage: Middleware = async ({ res, url, accepts }, next) => {
  await next();
  if (res.status === 404 && accepts.type('text/html')) {
    res.status = 404; // explicit status
    res.body = `<h1>Not Found</h1><p>Where in the world is ${htmlEncode(
      url.pathname
    )}?</p>`;
    res.headers.set('content-type', 'text/html');
  }
};

const assertAuthenticated: Middleware = async (context, next) => {
  if (context.state.user) {
    await next();
    return;
  }
  if (context.accepts.type('text/html')) {
    context.res.redirect(getAuthorizeUrl(context.url));
    return;
  }
  throw new UnauthorizedError(
    `${context.url.pathname} requires authentication.`
  );
};

const router = new Router();

router
  .get('/', ({ res }) => {
    res.body = '<h1>This is it!</h1>';
    res.headers.set('content-type', 'text/html');
  })
  .get('/echo-headers', ({ req, res }) => {
    res.status = 200;
    res.headers.set('content-type', 'application/json');
    /** @type {Record<string, string>} */
    const headers = {};
    // @ts-ignore
    req.headers.forEach((v, k) => (headers[k] = v));
    res.body = JSON.stringify(headers, null, 2);
  })
  .get('/hello-world', ({ res }) => {
    res.body = 'hello world';
    res.headers.set('content-type', 'text/plain');
  })
  .get('/api/auth/callback', handleTokenCallback)
  .get('/sign-out', handleSignout)
  .get('/signed-out', ({ res }) => {
    res.body = 'signed out.';
    res.headers.set('content-type', 'text/plain');
  })
  .get('/error-test', errorTest)
  .get('/eject', context =>
    context.respondWith(new Response('ejected', { status: 200 }))
  )
  .post('/api/tenants', handleRegister)
  .get('/api/me', assertAuthenticated, ({ res, state }) => {
    res.body = JSON.stringify(state.user);
    res.headers.set('content-type', 'application/json');
  })
  .get('/api/greetings/:greeting', assertAuthenticated, ({ res, state }) => {
    res.body = JSON.stringify(state.params);
    res.headers.set('content-type', 'application/json');
  })
  .get('/stream', ({ res }) => {
    res.body = html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Demo</title>
        </head>

        <body>
          <h1>Demo</h1>
          <p>${getManagementToken().then(x => x.substr(0, 5))}</p>
          <p>
            ${fetch('https://example.com').then(response => response.body)}
          </p>
        </body>
      </html>
    `;
  })
  .get('/cosmos', async ctx => {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ORIGIN,
      masterKey: process.env.COSMOS_DB_MASTER_KEY,
      dbId: process.env.COSMOS_DB_DATABASE,
      collId: 'my-coll2'
    });
    const partitionKey: PartitionKeyDefinition = {
      paths: ['/_partitionKey'],
      kind: 'Hash'
    };
    const response = await client.getCollection();
    if (response.status === 404) {
      await client.createCollection({ partitionKey });
    }
    const document = { id: 'a', hello: 'world', _partitionKey: 'test' };
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    document.id = 'b';
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    document.id = 'c';
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    document.id = 'd';
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    document.id = 'e';
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    document.id = 'f';
    await client.createDocument({
      document,
      partitionKey: 'test',
      isUpsert: true
    });
    const res = await client.queryDocuments({
      query: 'select x.id from ROOT x',
      partitionKey: 'test',
      parameters: [{ name: '@a', value: 'f' }]
    });
    ctx.res.body = JSON.stringify(await res.json());
    ctx.res.headers.set('content-type', 'application/json');
  })
  .get('/cosmos2', async ctx => {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ORIGIN,
      masterKey: process.env.COSMOS_DB_MASTER_KEY,
      dbId: process.env.COSMOS_DB_DATABASE,
      collId: 'my-coll2'
    });
    const res = await client.queryDocuments({
      query: 'select x.id from ROOT x',
      partitionKey: 'test',
      parameters: [{ name: '@a', value: 'f' }]
    });
    ctx.res.body = JSON.stringify(await res.json());
    ctx.res.headers.set('content-type', 'application/json');
  });

new Application()
  .use(exceptionHandler)
  .use(originAndReferrerValidation)
  .use(authentication)
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
