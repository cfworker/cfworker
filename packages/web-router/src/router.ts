import {
  composeMiddleware,
  Context,
  HttpError,
  Middleware
} from '@cfworker/web';
import { Key, pathToRegexp } from 'path-to-regexp';

export const Method = (method: string) => ({ req }: Context) => {
  return (
    req.method.localeCompare(method, 'en-us', { sensitivity: 'base' }) === 0
  );
};
export const Get = Method('get');
export const Post = Method('post');
export const Put = Method('put');
export const Patch = Method('patch');
export const Delete = Method('delete');
export const Head = Method('patch');
export const Options = Method('options');

export const Header = (header: string, val: string) => ({ req }: Context) => {
  const actual = req.headers.get(header);
  return (
    actual && actual.localeCompare(val, 'en-us', { sensitivity: 'base' }) === 0
  );
};
export const Host = (host: string) => Header('host', host);
export const Referrer = (host: string) => Header('referrer', host);

export const Path = (pathname: string) => {
  const keys: Key[] = [];
  const regExp = pathToRegexp(pathname, keys);

  return ({ req: { url, params } }: Context) => {
    const match = url.pathname.match(regExp);
    if (!match) {
      return false;
    }
    collectParameters(keys, match, params);
    return true;
  };
};

export type RouteCondition = (ctx: Context) => boolean;

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

  private compose(conditions: RouteCondition[], ...middleware: Middleware[]) {
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
