import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../server/src/app';

// Vercel rewrites /api/:path* here with ?path=:path*. Restore the original
// pathname so the same Express routes work locally and in the function.
export default function handler(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url || '/', 'http://vercel.internal');
  const path = url.searchParams.get('path');
  if (!path || path.startsWith('/') || path.split('/').includes('..')) {
    response.statusCode = 404;
    response.end('Not found');
    return;
  }
  url.searchParams.delete('path');
  request.url = `/api/${path}${url.search}`;
  app(request, response);
}
