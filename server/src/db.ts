import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
export const databaseConfigured = Boolean(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', error => {
  console.error('Database idle client error:', error.message);
});
