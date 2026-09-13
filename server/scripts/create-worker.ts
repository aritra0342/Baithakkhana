import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { databaseConfigured, pool } from '../src/db';
import { hashPassword } from '../src/auth';

const email = process.env.WORKER_EMAIL?.trim().toLowerCase();
const displayName = process.env.WORKER_NAME?.trim();
const password = process.env.WORKER_PASSWORD;
const role = process.env.WORKER_ROLE;
if (!databaseConfigured) throw new Error('Set DATABASE_URL in .env first.');
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid WORKER_EMAIL.');
if (!displayName || displayName.length > 80) throw new Error('Set WORKER_NAME (max 80 characters).');
if (!password) throw new Error('Set WORKER_PASSWORD (at least 12 characters).');
if (role !== 'staff' && role !== 'manager') throw new Error('Set WORKER_ROLE to staff or manager.');

try {
  await pool.query(`INSERT INTO workers(id, display_name, email, password_hash, role)
    VALUES ($1,$2,$3,$4,$5)`, [randomUUID(), displayName, email, await hashPassword(password), role]);
  console.log(`Created ${role} account for ${email}.`);
} finally { await pool.end(); }
