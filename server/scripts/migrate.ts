import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pool, databaseConfigured } from '../src/db';

if (!databaseConfigured) throw new Error('Set DATABASE_URL in .env before running migrations.');
const sql = await readFile(resolve('server/migrations/001_init.sql'), 'utf8');
try {
  await pool.query(sql);
  console.log('Neon schema is ready.');
} finally { await pool.end(); }
