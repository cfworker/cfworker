import {
  Application,
  htmlEncode,
  HttpError,
  Middleware,
  Router
} from '@cfworker/web';
import { handleRegister } from './management.js';
import {
  auth0Origin,
  authentication,
  getAuthorizeUrl,
  handleSignout,
  handleTokenCallback
} from './oauth-flow.js';

const originAndRefererValidation: Middleware = async (context, next) => {
  const { url, method, headers } = context.req;

  const permitted = [url.origin, auth0Origin];

  const originHeader = headers.get('origin');
  if (originHeader && !permitted.includes(originHeader)) {
    throw new HttpError(400, `Invalid origin "${originHeader}"`);
  }

  const refererHeader = headers.get('referer');
  if (
    refererHeader &&
    method !== 'GET' &&
    !permitted.includes(new URL(refererHeader).origin)
  ) {
    throw new HttpError(400, `Invalid ${method} referer "${refererHeader}"`);
  }

  await next();
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

const assertAuthenticated: Middleware = async (context, next) => {
  if (context.state.user) {
    await next();
    return;
  }
  if (context.req.accepts.type('text/html')) {
    context.res.redirect(getAuthorizeUrl(context.req.url));
    return;
  }
  throw new HttpError(
    401,
    `${context.req.url.pathname} requires authentication.`
  );
};

const router = new Router();

router
  .get('/', ({ res }) => {
    res.body =
      '<h1>cfworker</h1><a href="https://github.com/cfworker/cfworker">GitHub</a>';
  })
  .get('/api/auth/callback', handleTokenCallback)
  .get('/sign-out', handleSignout)
  .get('/signed-out', ({ res }) => {
    res.body = 'signed out.';
    res.headers.set(
      'clear-site-data',
      '"cache", "cookies", "storage", "executionContexts"'
    );
  })
  .post('/api/tenants', handleRegister)
  .get('/api/me', assertAuthenticated, ({ res, state }) => {
    res.body = state.user;
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
  .use(originAndRefererValidation)
  .use(authentication)
  .use(notFoundPage)
  .use(router.middleware)
  .listen();
