import { Middleware } from '@cfworker/web';

export const cachingMiddleware: Middleware = async ({ res }, next) => {
  await next();
  if (res.status < 400) {
    res.headers.set('cache-control', `public, max-age ${15 * 60}, immutable`);
  }
};
