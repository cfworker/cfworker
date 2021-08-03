import { Middleware } from '@cfworker/web';
import { cssHash } from '../inline-styles';

export const securityMiddleware: Middleware = async ({ res }, next) => {
  const [hash] = await Promise.all([cssHash, next()]);

  // hsts
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  // https://hstspreload.org/
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  res.headers.set('X-Content-Type-Options', 'nosniff');

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  res.headers.set(
    'Content-Security-Policy',
    `default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' https://github.com; style-src 'self' '${hash}'; frame-ancestors 'self'; form-action 'self';`
  );
};
