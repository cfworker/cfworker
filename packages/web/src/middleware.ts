import { Context } from './context';
import compose, { Middleware as GenericMiddleware } from 'koa-compose';

export type Middleware = GenericMiddleware<Context>;

export const composeMiddleware = compose;
