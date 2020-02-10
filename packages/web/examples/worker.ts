import { Application, Middleware, escape } from '@cfworker/web';

// Exception handler middleware example:
const exceptionHandler: Middleware = async (context, next) => {
  const { res, accepts } = context;
  try {
    await next();
  } catch (err) {
    res.status = 500;
    if (accepts.type('text/html')) {
      res.body = `<h1>Internal Server Error</h1><p><pre><code>${escape(
        err.stack
      )}</code></pre></p>`;
      res.headers.set('content-type', 'text/html');
    } else {
      res.body = `Internal Server Error\n${err.stack}`;
      res.headers.set('content-type', 'text/plain');
    }
  }
};

// Simple request handler middleware. Consider using @cfworker/web-router for more advanced scenarios.
const requestHandler: Middleware = context => {
  const { res, url } = context;

  // Throw an error to demonstrate the exceptionHandler middleware.
  if (url.searchParams.has('throw')) {
    // @ts-ignore
    self.thisMethodDoesNotExist('an exception will be thrown');
  }

  // Eject from middleware, use FetchEvent.respondWith directly.
  if (url.searchParams.has('eject')) {
    context.respondWith(new Response('Ejected!', { status: 200 }));
  }

  res.body = `
    <h1>Hello world!</h1>
    <img alt="Cloudflare global network" src="https://workers.cloudflare.com/resources/illustrations/global-network.svg">
    <p><a href="?throw">Throw an error</a> or <a href="?eject">eject from middleware stack</a></p>`;
  res.headers.set('content-type', 'text/html');
};

new Application()
  .use(exceptionHandler)
  .use(requestHandler)
  .listen();

/*
yarn workspace @cfworker/web cfworker run examples/example.ts --watch
 */
