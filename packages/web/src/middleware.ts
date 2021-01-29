import compose, { Middleware as GenericMiddleware } from 'koa-compose';
import { Context } from './context.js';

export type Middleware = GenericMiddleware<Context>;

export const composeMiddleware = compose;
