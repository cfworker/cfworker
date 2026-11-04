import { Context } from './context.js';
import { composeMiddleware, Middleware } from './middleware.js';

export interface URLPatternOptions {
  ignoreCase?: boolean;
}

interface PathnamePatternResult {
  pathname: {
    groups: Record<string, string | undefined>;
  };
}

interface PathnamePattern {
  exec(input: { pathname: string }): PathnamePatternResult | null;
}

interface URLPatternConstructor {
  new (
    input: { pathname: string },
    options?: URLPatternOptions
  ): PathnamePattern;
}

const URLPattern = (
  globalThis as unknown as { URLPattern: URLPatternConstructor }
).URLPattern;

export type Predicate = (context: Context) => boolean;

export const Method: (method: string) => Predicate = (method: string) => {
  method = method.toUpperCase();
  return ({ req }: Context) => req.method === method;
};
export const Get: Predicate = Method('get');
export const Post: Predicate = Method('post');
export const Put: Predicate = Method('put');
export const Patch: Predicate = Method('patch');
export const Delete: Predicate = Method('delete');
export const Head: Predicate = Method('head');
export const Options: Predicate = Method('options');

export const Header: (header: string, value: string) => Predicate = (
  header: string,
  value: string
) => {
  value = value.toLowerCase();
  return ({ req }: Context) => req.headers.get(header) === value;
};
export const Host: (host: string) => Predicate = (host: string) =>
  Header('host', host);

export const defaultURLPatternOptions: URLPatternOptions = {
  ignoreCase: true
};

export const Path: (
  pattern: string,
  options?: URLPatternOptions
) => Predicate = (pattern: string, options?: URLPatternOptions) => {
  const urlPattern = new URLPattern(
    { pathname: pattern },
    { ...defaultURLPatternOptions, ...options }
  );

  return ({ req: { url, params } }: Context) => {
    const match = matchPathname(urlPattern, url.pathname);
    if (!match) {
      return false;
    }
    collectParameters(match.pathname.groups, params);
    return true;
  };
};

export type RouteCondition = (context: Context) => boolean;

export interface Route {
  conditions: RouteCondition[];
  middleware: Middleware;
}

export interface RouterOptions {
  urlPatternOptions?: URLPatternOptions;
}

export const defaultRouterOptions: RouterOptions = {
  urlPatternOptions: defaultURLPatternOptions
};

export class Router {
  private readonly routes: Route[];

  constructor(private readonly options: RouterOptions = defaultRouterOptions) {
    this.routes = [];
  }

  public get(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Get, Path(pathname, opts)], ...middleware);
  }

  public post(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Post, Path(pathname, opts)], ...middleware);
  }

  public put(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Put, Path(pathname, opts)], ...middleware);
  }

  public patch(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Patch, Path(pathname, opts)], ...middleware);
  }

  public delete(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Delete, Path(pathname, opts)], ...middleware);
  }

  public head(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Head, Path(pathname, opts)], ...middleware);
  }

  public all(pathname: string, ...middleware: Middleware[]): Router {
    const opts = this.options.urlPatternOptions;
    return this.compose([Path(pathname, opts)], ...middleware);
  }

  public middleware: Middleware = async (ctx, next) => {
    const resolved = this.resolve(ctx);

    if (resolved) {
      await resolved.middleware(ctx, next);
    } else {
      await next();
    }
  };

  public compose(
    conditions: RouteCondition[],
    ...middleware: Middleware[]
  ): Router {
    this.routes.push({
      conditions,
      middleware: composeMiddleware(middleware)
    });
    return this;
  }

  public resolve(ctx: Context): Route | undefined {
    return this.routes.find(
      ({ conditions }) =>
        conditions.length === 0 || conditions.every(c => c(ctx))
    );
  }
}

function matchPathname(
  pattern: PathnamePattern,
  pathname: string
): PathnamePatternResult | null {
  const match = pattern.exec({ pathname });
  if (match || !pathname.endsWith('/')) {
    return match;
  }

  const pathnameWithoutTrailingSlashes = pathname.replace(/\/+$/, '') || '/';
  return pattern.exec({ pathname: pathnameWithoutTrailingSlashes });
}

function collectParameters(
  groups: Record<string, string | undefined>,
  params: Record<string, string>
) {
  for (const [name, value] of Object.entries(groups)) {
    if (!value) {
      continue;
    }
    params[name] = decodeURIComponent(value);
  }
}
