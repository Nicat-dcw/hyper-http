import FindMyWay, { HTTPMethod } from 'find-my-way';
import { Context, Handler } from './types';

export class Router {
  private router = FindMyWay({
    defaultRoute: (req, res) => {
      res.statusCode = 404;
      res.end('Not Found');
    },
  });

  private wrapHandler(handler: Handler) {
    return async (req: Request, res: any, params: any) => {
      const ctx = new Context(req, res);
      ctx.params = params;

      const response = await handler(ctx);
      return response; // Return the response instead of directly writing to res
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

  // Modify handle method to return a Response
  async handle(req: Request): Promise<Response> {
    try {
      const result = this.router.find(req.method as HTTPMethod, req.url);
      if (result) {
        return await result.handler(req, null, result.params);
      }
      
      // Default 404 response if no route found
      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      // Error handling
      console.error('Router handle error:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}