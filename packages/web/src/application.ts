import statuses from 'statuses';
import { Context } from './context.js';
import { HttpError } from './http-error.js';
import { composeMiddleware, Middleware } from './middleware.js';

const resolved = Promise.resolve();

export class Application {
  private readonly middleware: Middleware[] = [];

  public use(middleware: Middleware) {
    this.middleware.push(middleware);
    return this;
  }

  public listen() {
    const middleware = composeMiddleware(this.middleware);
    addEventListener('fetch', event => this.handleFetch(event, middleware));
  }

  private handleFetch(event: FetchEvent, middleware: Middleware) {
    const context = new Context(event);
    event.respondWith(
      Promise.race([
        this.invokeMiddleware(context, middleware),
        context.responded
      ])
    );
  }

  private async invokeMiddleware(context: Context, middleware: Middleware) {
    try {
      await middleware(context, () => resolved);
      return context.res.create();
    } catch (err) {
      console.error((err ?? ({} as any)).stack ?? err);

      if (err instanceof HttpError) {
        return err.toResponse();
      }

      const status = 500;
      const statusText = statuses[500]!;
      const headers = { 'content-type': 'text/plain' };
      return new Response(statusText, { status, statusText, headers });
    }
  }
}
