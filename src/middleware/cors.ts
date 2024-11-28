import { Context } from '../framework/types';

interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  headers?: string[];
}

export const cors = (options: CorsOptions = {}) => {
  const origin = options.origin || '*';
  const methods = options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const headers = options.headers || ['Content-Type'];

  const corsHeaders = {
    'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(',') : origin,
    'Access-Control-Allow-Methods': methods.join(','),
    'Access-Control-Allow-Headers': headers.join(',')
  };

  return async (c: Context, next: () => Promise<Response>) => {
    if (c.request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const response = await next();
    const newHeaders = new Headers(response.headers);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  };
}