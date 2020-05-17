import statuses from 'statuses';
import { Context } from './context';
import { HttpError } from './http-error';
import { composeMiddleware, Middleware } from './middleware';

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
      console.error(err.stack || err.toString());
      const headers = { 'content-type': 'text/plain' };
      if (err instanceof HttpError) {
        const { status, statusText, message } = err;
        return new Response(message, { status, statusText, headers });
      }
      const statusText = statuses[500];
      return new Response(statusText, { status: 500, statusText, headers });
    }
  }
}
