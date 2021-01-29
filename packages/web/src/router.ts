import { Key, pathToRegexp } from 'path-to-regexp';
import { Context } from './context.js';
import { HttpError } from './http-error.js';
import { composeMiddleware, Middleware } from './middleware.js';

export const Method = (method: string) => {
  method = method.toUpperCase();
  return ({ req }: Context) => req.method === method;
};
export const Get = Method('get');
export const Post = Method('post');
export const Put = Method('put');
export const Patch = Method('patch');
export const Delete = Method('delete');
export const Head = Method('head');
export const Options = Method('options');

export const Header = (header: string, value: string) => {
  value = value.toLowerCase();
  return ({ req }: Context) => req.headers.get(header) === value;
};
export const Host = (host: string) => Header('host', host);
export const Referer = (host: string) => Header('referer', host);

export const Path = (pattern: string) => {
  const keys: Key[] = [];
  const regExp = pathToRegexp(pattern, keys);

  return ({ req: { url, params } }: Context) => {
    const match = url.pathname.match(regExp);
    if (!match) {
      return false;
    }
    collectParameters(keys, match, params);
    return true;
  };
};

export type RouteCondition = (context: Context) => boolean;

export interface Route {
  conditions: RouteCondition[];
  middleware: Middleware;
}

export class Router {
  private readonly routes: Route[];

  constructor() {
    this.routes = [];
  }

  public get(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Get, Path(pathname)], ...middleware);
  }

  public post(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Post, Path(pathname)], ...middleware);
  }

  public put(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Put, Path(pathname)], ...middleware);
  }

  public patch(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Patch, Path(pathname)], ...middleware);
  }

  public delete(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Delete, Path(pathname)], ...middleware);
  }

  public head(pathname: string, ...middleware: Middleware[]) {
    return this.compose([Head, Path(pathname)], ...middleware);
  }

  public all(...middleware: Middleware[]) {
    return this.compose([], ...middleware);
  }

  public middleware: Middleware = async (ctx, next) => {
    const resolved = this.resolve(ctx);

    if (resolved) {
      await resolved.middleware(ctx, next);
    } else {
      await next();
    }
  };

  public compose(conditions: RouteCondition[], ...middleware: Middleware[]) {
    this.routes.push({
      conditions,
      middleware: composeMiddleware(middleware)
    });
    return this;
  }

  private resolve(ctx: Context) {
    return this.routes.find(
      ({ conditions }) =>
        conditions.length === 0 || conditions.every(c => c(ctx))
    );
  }
}

function collectParameters(
  keys: Key[],
  match: RegExpMatchArray,
  params: Record<string, string>
) {
  for (let i = 1; i < match.length; i++) {
    const name = keys[i - 1].name;
    const value = match[i];
    if (!value) {
      continue;
    }
    params[name] = decodePathnameComponent(value);
  }
}

function decodePathnameComponent(component: string): string {
  if (component.length === 0) {
    return component;
  }

  try {
    return decodeURIComponent(component);
  } catch (err) {
    if (err instanceof URIError) {
      throw new HttpError(
        400,
        `Unable to decode pathname component "${component}".`
      );
    }
    throw err;
  }
}
