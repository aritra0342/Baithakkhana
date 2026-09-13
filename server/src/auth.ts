import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response, NextFunction } from 'express';
import { pool } from './db';
import type { Worker } from '../../shared/contracts';

const scrypt = promisify(scryptCallback);
const cookieName = 'bk_worker_session';
const sessionDays = 7;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export async function hashPassword(password: string) {
  if (password.length < 12) throw new Error('Worker passwords must be at least 12 characters.');
  const salt = randomBytes(24).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [salt, expectedHex] = encoded.split(':');
  if (!salt || !expectedHex || expectedHex.length !== 128) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(expected, actual);
}

function cookieValue(req: Request) {
  const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
  return cookie?.slice(cookieName.length + 1);
}

function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/admin' };
}

export async function startSession(res: Response, workerId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionDays * 86400_000);
  await pool.query('INSERT INTO worker_sessions(token_hash, worker_id, expires_at) VALUES ($1, $2, $3)', [digest(token), workerId, expiresAt]);
  res.cookie(cookieName, token, { ...cookieOptions(), expires: expiresAt });
}

export async function endSession(req: Request, res: Response) {
  const token = cookieValue(req);
  if (token) await pool.query('DELETE FROM worker_sessions WHERE token_hash = $1', [digest(token)]);
  res.clearCookie(cookieName, cookieOptions());
}

export async function currentWorker(req: Request): Promise<Worker | null> {
  const token = cookieValue(req);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await pool.query<{
    id: string; display_name: string; email: string; role: Worker['role'];
  }>(`SELECT w.id, w.display_name, w.email, w.role
    FROM worker_sessions s JOIN workers w ON w.id = s.worker_id
    WHERE s.token_hash = $1 AND s.expires_at > now() AND w.active = true`, [digest(token)]);
  const row = result.rows[0];
  return row ? { id: row.id, displayName: row.display_name, email: row.email, role: row.role } : null;
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.APP_ORIGIN || (process.env.VERCEL ? `https://${req.headers.host}` : 'http://127.0.0.1:5173');
  if (req.headers.origin !== expected) {
    res.status(403).json({ error: 'Request origin is not allowed.' });
    return;
  }
  next();
}

export type WorkerRequest = Request & { worker?: Worker };
export async function requireWorker(req: WorkerRequest, res: Response, next: NextFunction) {
  try {
    const worker = await currentWorker(req);
    if (!worker) { res.status(401).json({ error: 'Sign in to continue.' }); return; }
    req.worker = worker;
    next();
  } catch (error) { next(error); }
}
