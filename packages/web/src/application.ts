import statuses from 'statuses';
import { Context } from './context.js';
import { HttpError } from './http-error.js';
import { composeMiddleware, Middleware } from './middleware.js';

const resolved = Promise.resolve();

export class Application {
  private readonly middleware: Middleware[] = [];
  private _composedMiddleware?: Middleware;

  private get composedMiddleware() {
    if (!this._composedMiddleware) {
      this._composedMiddleware = composeMiddleware(this.middleware);
    }
    return this._composedMiddleware;
  }

  public use(middleware: Middleware): Application {
    this.middleware.push(middleware);
    this._composedMiddleware = undefined;
    return this;
  }

  public async handleRequest(
    request: Request,
    env: any,
    context: {
      waitUntil(promise: Promise<any>): void;
    }
  ): Promise<Response> {
    return this.invokeMiddleware(
      new Context(request, env, context),
      this.composedMiddleware
    );
  }

  private async invokeMiddleware(context: Context, middleware: Middleware) {
    try {
      await middleware(context, () => resolved);
      return context.res.create();
    } catch (err) {
      console.error((err as any)?.stack ?? err);

      if (err instanceof HttpError) {
        return err.toResponse();
      }

      const status = 500;
      const statusText = statuses.message[500];
      const headers = { 'content-type': 'text/plain' };
      return new Response(statusText, { status, statusText, headers });
    }
  }
}
