import FindMyWay, { HTTPMethod } from "find-my-way";
import { Context, Handler } from "./types";

export class Router {
  private router = FindMyWay({
    defaultRoute: (req: any, res: any) => {
      res.statusCode = 404;
      res.end("Not Found");
    },
  });

  private async getRequestBody(req: Request): Promise<string | null> {
    try {

      if (!req.body) return null;


      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return JSON.stringify(await req.json());
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        return await req.text();
      } else {
        return await req.text();
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return null;
    }
  }

  private wrapHandler(handler: Handler) {
    return async (req: any, res: any, params: any) => {
      try {

        let request: Request;
        if (!(req instanceof Request)) {

          const url = req.url
            ? `http://localhost${req.url}`
            : "http://localhost/";
          request = new Request(url, {
            method: req.method,
            headers: new Headers(req.headers || {}),
            body: req.body ? JSON.stringify(req.body) : null,
          });
        } else {
          request = req;
        }


        const ctx = new Context(request, new Response());
        ctx.params = params;


        const response = await handler(ctx);
        return response;
      } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    };
  }

  add(method: HTTPMethod, path: string, handler: Handler) {
    this.router.on(method, path, this.wrapHandler(handler));
  }

  get(path: string, handler: Handler) {
    this.add("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.add("POST", path, handler);
  }

  put(path: string, handler: Handler) {
    this.add("PUT", path, handler);
  }

  delete(path: string, handler: Handler) {
    this.add("DELETE", path, handler);
  }

  async handle(req: Request): Promise<Response> {
    try {
      const result = this.router.find(req.method as HTTPMethod, req.url);

      if (result) {
        // @ts-ignore
        return await result.handler(req, null, result.params);
      }

      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("Router Handle Error:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
}
