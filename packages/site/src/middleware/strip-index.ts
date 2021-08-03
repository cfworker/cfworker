import { Middleware } from '@cfworker/web';

const index = /\/index(\.html)?$/i;

export const stripIndex: Middleware = async function stripIndex(
  { req, res },
  next
) {
  const pathname = req.url.pathname;
  if (index.test(pathname)) {
    req.url.pathname = pathname.replace(index, '/');
    res.redirect(req.url.href);
    return;
  }
  await next();
};
