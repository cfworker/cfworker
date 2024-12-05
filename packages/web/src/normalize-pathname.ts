import { Context } from './context.js';
import { HttpError } from './http-error.js';
import { Middleware } from './middleware.js';

export function normalizePathname(pathname: string): string {
  return decodeURIComponent(pathname).replace(/\/\/+/g, '/').normalize();
}

export const normalizePathnameMiddleware: Middleware = async (
  { req }: Context,
  next: () => Promise<void>
) => {
  const pathname = req.url.pathname;
  try {
    req.url.pathname = normalizePathname(pathname);
  } catch (err) {
    if (err instanceof URIError) {
      throw new HttpError(400, `Unable to decode pathname "${pathname}".`);
    }
    throw err;
  }
  await next();
};
