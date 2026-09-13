import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import handler from '../../api/index';

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer(handler);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP port');
  base = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

describe('Vercel API entry', () => {
  it('restores the rewritten API pathname', async () => {
    const response = await fetch(`${base}/api/index?path=health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ configured: false });
  });
  it('keeps the API namespace protected', async () => {
    const response = await fetch(`${base}/api/index?path=admin/session`);
    expect(response.status).toBe(503);
  });
  it('does not accept a missing rewrite parameter', async () => {
    const response = await fetch(`${base}/api/index`);
    expect(response.status).toBe(404);
  });
});
