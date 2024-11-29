import { createServer } from "node:http";
import { Router } from "./router";
import { Context, Handler, Middleware } from "./types.ts";

export class App {
  private router: Router;
  private middlewares: Middleware[] = [];
  constructor() {
    this.router = new Router();
  }

  get(path: string, handler: Handler) {
    this.router.get(path, handler);
    return this;
  }

  post(path: string, handler: Handler) {
    this.router.post(path, handler);
    return this;
  }

  put(path: string, handler: Handler) {
    this.router.put(path, handler);
    return this;
  }

  delete(path: string, handler: Handler) {
    this.router.delete(path, handler);
    return this;
  }

  use(middlewareOrPath: Middleware | string, middleware?: Middleware) {
    if (typeof middlewareOrPath === "string" && middleware) {

      const path = middlewareOrPath;
      const pathMiddleware: Middleware = async (ctx, next) => {

        if (ctx.url.pathname.startsWith(path)) {
          return middleware(ctx, next);
        }
        return next();
      };
      this.middlewares.push(pathMiddleware);
    } else if (typeof middlewareOrPath === "function") {

      this.middlewares.push(middlewareOrPath);
    } else {
      throw new Error("Invalid middleware configuration");
    }
    return this;
  }

  listen(port: number, callback?: () => void): Server {
    const MAX_BODY_SIZE = 1024 * 1024;
    const bodyBuffer = Buffer.allocUnsafe(MAX_BODY_SIZE);

    const server = createServer((req, res) => {
      if (!req.url) {
        res.statusCode = 400;
        return res.end();
      }

      const ctx = new Context(null, null);
      let bodyLength = 0;

      req.on("data", (chunk) => {
        const chunkLength = chunk.length;

        if (bodyLength + chunkLength > MAX_BODY_SIZE) {
          req.destroy();
          return;
        }

        chunk.copy(bodyBuffer, bodyLength);
        bodyLength += chunkLength;
      });

      req.on("end", async () => {
        try {
          const request = new Request(
            `http://${req.headers.host || "localhost"}${req.url}`,
            {
              method: req.method,
              headers: Object.entries(req.headers).reduce(
                (headers, [key, value]) => {
                  if (value)
                    headers.set(
                      key,
                      Array.isArray(value) ? value.join(",") : value,
                    );
                  return headers;
                },
                new Headers(),
              ),
              body:
                bodyLength > 0
                  ? bodyBuffer.subarray(0, bodyLength).toString("utf8")
                  : null,
            },
          );

          const executeMiddlewares = async (
            index: number,
          ): Promise<Response> => {
            if (!this.middlewares?.length) {
              return this.router.handle(request);
            }

            if (index >= this.middlewares.length) {
              return this.router.handle(request);
            }

            ctx.request = request;
            ctx.response = new Response();

            const middleware = this.middlewares[index];
            const next = () => executeMiddlewares(index + 1);

            return middleware(ctx, next);
          };

          const response = await executeMiddlewares(0);

          const responseBody = await response.arrayBuffer();

          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(Buffer.from(responseBody));
        } catch (error) {
          res.statusCode = 500;
          res.end();
          console.error("Request Processing Error:", error);
        }
      });

      req.on("error", () => {
        res.statusCode = 400;
        res.end();
      });
    });

    server.listen(port, callback);

    server.on("error", (err) => {
      console.error("Server Startup Error:", err);
    });

    return server;
  }
}
