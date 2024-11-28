import { createServer } from 'node:http';
import { Router } from './router';
import { Context, Handler, Middleware } from './types.ts';

export class App {
  private router: Router;

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

  use(middleware: Middleware) {
    // Implement middleware support if needed
    return this;
  }

  listen(port: number, callback?: () => void) {
    const server = createServer(async (req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      try {

        const bodyBuffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', reject);
        });
        
        const bodyText = bodyBuffer.toString('utf8');

        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: new Headers(req.headers as Record<string, string>),
          body: bodyText || null,
          
        });

        const response = await this.router.handle(request);
        const responseBody = await response.text();


        const headers = Object.fromEntries(response.headers);
        res.writeHead(response.status, headers);
        res.end(responseBody);
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(port, callback);
    return server;
  }
}