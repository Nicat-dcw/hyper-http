import { Context } from './context.ts';

export type Handler<T = unknown> = (c: Context) => Promise<Response> | Response;
export type Middleware = (c: Context, next: () => Promise<Response>) => Promise<Response>;

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}
export {Context};