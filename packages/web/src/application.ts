import { Context } from './context';
import { composeMiddleware, Middleware } from './middleware';

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
      await middleware(context, () => Promise.resolve());
      return context.res.create();
    } catch (err) {
      console.error(err.stack || err.toString());
      return new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error'
      });
    }
  }
}
