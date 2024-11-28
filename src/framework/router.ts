import FindMyWay, { HTTPMethod } from 'find-my-way';
import { Context, Handler } from './types';
import { IncomingMessage } from 'node:http'
export class Router {
  private router = FindMyWay({
    defaultRoute: (req, res) => {
      res.statusCode = 404;
      res.end('Not Found');
    },
  });

  private wrapHandler(handler: Handler) {

  return async (req: IncomingMessage, res: any, params: any) => {
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
    });
    const ctx = new Context(request, res);
    ctx.params = params;

    const response = await handler(ctx);
    return response;
  };

  }

  add(method: HTTPMethod, path: string, handler: Handler) {
    this.router.on(method, path, this.wrapHandler(handler));
  }

  get(path: string, handler: Handler) {
    this.add('GET', path, handler);
  }

  post(path: string, handler: Handler) {
    this.add('POST', path, handler);
  }

  put(path: string, handler: Handler) {
    this.add('PUT', path, handler);
  }

  delete(path: string, handler: Handler) {
    this.add('DELETE', path, handler);
  }


  async handle(req: Request): Promise<Response> {
    try {
      const result = this.router.find(req.method as HTTPMethod, req.url);
if (result) {
  // @ts-ignore
  return await result.handler(req, null, result.params, null, null);
}
      

      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
   
      console.error(error)
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}