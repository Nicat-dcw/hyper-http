import { Context } from "./context";

export type Handler<T = unknown> = (c: Context) => Promise<Response> | Response;
export type Middleware = (
  ctx: Context,
  next: () => Promise<Response>,
) => Promise<Response>;

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}
export { Context };
