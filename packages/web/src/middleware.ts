import { Context } from './context';

export interface Middleware {
  (context: Context, next: () => Promise<void>): void | Promise<void>;
}

export function composeMiddleware(middleware: Middleware[]): Middleware {
  return context => {
    let index = -1;
    function dispatch(i: number): Promise<void> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      if (i === middleware.length) {
        return Promise.resolve();
      }
      const fn = middleware[i];
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
