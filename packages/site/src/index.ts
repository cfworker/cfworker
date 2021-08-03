import { Application, normalizePathnameMiddleware } from '@cfworker/web';
import { cachingMiddleware } from './middleware/caching';
import { securityMiddleware } from './middleware/security';
import { stripIndex } from './middleware/strip-index';
import { routes } from './routes';

const application = new Application();

if (String(process.env.NODE_ENV) === 'production') {
  application.use(securityMiddleware).use(cachingMiddleware);
}

application
  .use(normalizePathnameMiddleware)
  .use(stripIndex)
  .use(routes)
  .listen();
