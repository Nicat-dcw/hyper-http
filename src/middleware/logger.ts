import { Context } from '../framework/types.ts';

export const logger = () => {
  return async (c: Context, next: () => Promise<Response>) => {
    const start = performance.now();
    const response = await next();
    const duration = Math.round(performance.now() - start);
    
    console.log(`${c.request.method} ${c.url.pathname} - ${response.status} (${duration}ms)`);
    return response;
  };
}