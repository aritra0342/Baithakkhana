import express, { type ErrorRequestHandler } from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getCatalogItem } from '../../shared/catalog';
import type { OrderStatus, StaffOrder, Worker } from '../../shared/contracts';
import { databaseConfigured, pool } from './db';
import { currentWorker, endSession, requireSameOrigin, requireWorker, startSession, verifyPassword, type WorkerRequest } from './auth';
import { InvalidOrder, newOrderId, nextStatuses, orderSchema, prepareOrder } from './orderLogic';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const loginAttempts = new Map<string, { count: number; until: number }>();
const loginSchema = z.strictObject({ email: z.email().max(254), password: z.string().min(1).max(200) });
const statusSchema = z.strictObject({ status: z.enum(['received', 'preparing', 'ready', 'completed', 'cancelled']), version: z.number().int().positive() });
const claimSchema = z.strictObject({ version: z.number().int().positive() });

function unavailable(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!databaseConfigured) { res.status(503).json({ error: 'Neon is not configured for this deployment.' }); return; }
  next();
}

function handleError(error: unknown, res: express.Response) {
  if (error instanceof z.ZodError) { res.status(400).json({ error: 'Invalid request.', fields: z.flattenError(error).fieldErrors }); return; }
  if (error instanceof InvalidOrder) { res.status(400).json({ error: error.message }); return; }
  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 400) {
    res.status(400).json({ error: 'Malformed request.' }); return;
  }
  console.error('API error:', error instanceof Error ? error.message : String(error));
  res.status(503).json({ error: 'The order service is unavailable. Please try again.' });
}

app.get('/api/health', (_req, res) => res.json({ configured: databaseConfigured }));

app.post('/api/orders', unavailable, async (req, res) => {
  try {
    const input = orderSchema.parse(req.body);
    const { items, totals, storedDetails } = prepareOrder(input);
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = newOrderId();
      const inserted = await client.query<{ id: string }>(`INSERT INTO orders
        (id, client_request_id, request_hash, mode, customer_details, payment_method, subtotal_paise, packaging_paise, delivery_paise, discount_paise, total_paise)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (client_request_id) DO NOTHING RETURNING id`,
      [id, input.clientRequestId, requestHash, input.mode, JSON.stringify(storedDetails), input.paymentMethod,
        totals.subtotal, totals.packaging, totals.delivery, totals.discount, totals.total]);
      let orderId = inserted.rows[0]?.id;
      if (!orderId) {
        const existing = await client.query<{ id: string; request_hash: string }>('SELECT id, request_hash FROM orders WHERE client_request_id = $1', [input.clientRequestId]);
        if (!existing.rows[0] || existing.rows[0].request_hash !== requestHash) {
          await client.query('ROLLBACK');
          res.status(409).json({ error: 'This submission key was already used for another order.' });
          return;
        }
        orderId = existing.rows[0].id;
      } else {
        for (const [index, line] of items.entries()) {
          const catalogItem = getCatalogItem(line.itemId)!;
          await client.query(`INSERT INTO order_items
            (order_id, line_no, item_id, name_bn, name_en, quantity, unit_price_paise, line_total_paise, customizations)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [orderId, index + 1, line.itemId, catalogItem.bn, catalogItem.en, line.quantity,
            line.unitPrice, line.unitPrice * line.quantity, JSON.stringify(line.customizations)]);
        }
        await client.query(`INSERT INTO order_events(order_id, event_type, to_status) VALUES ($1, 'created', 'received')`, [orderId]);
      }
      const saved = await client.query(`SELECT id, mode, payment_method, subtotal_paise, packaging_paise, delivery_paise,
        discount_paise, total_paise, status, created_at FROM orders WHERE id = $1`, [orderId]);
      const savedItems = await client.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY line_no', [orderId]);
      await client.query('COMMIT');
      const row = saved.rows[0];
      res.status(inserted.rows.length ? 201 : 200).json({ order: {
        id: row.id, mode: row.mode, details: { payment: row.payment_method },
        items: savedItems.rows.map(line => ({ key: `${line.order_id}:${line.line_no}`, itemId: line.item_id,
          quantity: line.quantity, customizations: line.customizations, unitPrice: line.unit_price_paise })),
        totals: { subtotal: row.subtotal_paise, packaging: row.packaging_paise, delivery: row.delivery_paise,
          discount: row.discount_paise, total: row.total_paise },
        createdAt: new Date(row.created_at).getTime(), status: row.status, paymentMethod: row.payment_method,
      } });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally { client.release(); }
  } catch (error) { handleError(error, res); }
});

app.post('/api/admin/login', unavailable, requireSameOrigin, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const key = `${req.ip}:${email.toLowerCase()}`;
    const attempt = loginAttempts.get(key);
    if (attempt && attempt.count >= 5 && attempt.until > Date.now()) {
      res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' }); return;
    }
    const result = await pool.query<{ id: string; display_name: string; email: string; password_hash: string; role: Worker['role'] }>(
      'SELECT id, display_name, email, password_hash, role FROM workers WHERE email = $1 AND active = true', [email.toLowerCase()]);
    const row = result.rows[0];
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      loginAttempts.set(key, { count: (attempt?.until && attempt.until > Date.now() ? attempt.count : 0) + 1, until: Date.now() + 15 * 60_000 });
      res.status(401).json({ error: 'Invalid email or password.' }); return;
    }
    loginAttempts.delete(key);
    await startSession(res, row.id);
    res.json({ worker: { id: row.id, displayName: row.display_name, email: row.email, role: row.role } });
  } catch (error) { handleError(error, res); }
});

app.get('/api/admin/session', unavailable, async (req, res) => {
  try { const worker = await currentWorker(req); res.json({ worker }); }
  catch (error) { handleError(error, res); }
});
app.post('/api/admin/logout', unavailable, requireSameOrigin, async (req, res) => {
  try { await endSession(req, res); res.status(204).end(); }
  catch (error) { handleError(error, res); }
});

app.get('/api/admin/orders', unavailable, requireWorker, async (req: WorkerRequest, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    if (status && !['received', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid status filter.' }); return;
    }
    const mine = req.query.mine === 'true';
    const result = await pool.query(`SELECT o.*, w.display_name AS assigned_worker_name FROM orders o
      LEFT JOIN workers w ON w.id = o.assigned_worker_id
      WHERE ($1::text IS NULL OR o.status = $1) AND ($2::boolean = false OR o.assigned_worker_id = $3)
      ORDER BY CASE WHEN o.status IN ('received', 'preparing', 'ready') THEN 0 ELSE 1 END,
      o.created_at DESC LIMIT 100`, [status ?? null, mine, req.worker!.id]);
    const ids = result.rows.map(row => row.id as string);
    const itemResult = ids.length ? await pool.query('SELECT * FROM order_items WHERE order_id = ANY($1::text[]) ORDER BY line_no', [ids]) : { rows: [] };
    const itemMap = new Map<string, StaffOrder['items']>();
    for (const row of itemResult.rows) {
      const list = itemMap.get(row.order_id) ?? [];
      list.push({ key: `${row.order_id}:${row.line_no}`, itemId: row.item_id, quantity: row.quantity,
        customizations: row.customizations, unitPrice: row.unit_price_paise, nameBn: row.name_bn, nameEn: row.name_en });
      itemMap.set(row.order_id, list);
    }
    const orders: StaffOrder[] = result.rows.map(row => ({
      id: row.id, mode: row.mode, status: row.status as OrderStatus, customerDetails: row.customer_details,
      paymentMethod: row.payment_method, totals: { subtotal: row.subtotal_paise, packaging: row.packaging_paise,
        delivery: row.delivery_paise, discount: row.discount_paise, total: row.total_paise },
      items: itemMap.get(row.id) ?? [], assignedWorkerId: row.assigned_worker_id,
      assignedWorkerName: row.assigned_worker_name, version: row.version,
      createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
    }));
    res.json({ orders });
  } catch (error) { handleError(error, res); }
});

app.post('/api/admin/orders/:id/claim', unavailable, requireSameOrigin, requireWorker, async (req: WorkerRequest, res) => {
  try {
    const { version } = claimSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`UPDATE orders SET assigned_worker_id = $1, version = version + 1, updated_at = now()
        WHERE id = $2 AND version = $3 AND assigned_worker_id IS NULL AND status IN ('received','preparing','ready')
        RETURNING id`, [req.worker!.id, req.params.id, version]);
      if (!result.rowCount) { await client.query('ROLLBACK'); res.status(409).json({ error: 'This order changed. Refresh the queue.' }); return; }
      await client.query(`INSERT INTO order_events(order_id, actor_worker_id, event_type, note) VALUES ($1,$2,'claimed','Worker claimed order')`, [req.params.id, req.worker!.id]);
      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
    finally { client.release(); }
  } catch (error) { handleError(error, res); }
});

app.patch('/api/admin/orders/:id/status', unavailable, requireSameOrigin, requireWorker, async (req: WorkerRequest, res) => {
  try {
    const { status, version } = statusSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const current = await client.query<{ status: OrderStatus; version: number; assigned_worker_id: string | null }>(
        'SELECT status, version, assigned_worker_id FROM orders WHERE id = $1 FOR UPDATE', [req.params.id]);
      const row = current.rows[0];
      if (!row) { await client.query('ROLLBACK'); res.status(404).json({ error: 'Order not found.' }); return; }
      if (row.version !== version) { await client.query('ROLLBACK'); res.status(409).json({ error: 'This order changed. Refresh the queue.' }); return; }
      if (!nextStatuses[row.status].includes(status as never) || (status === 'cancelled' && req.worker!.role !== 'manager')) {
        await client.query('ROLLBACK'); res.status(400).json({ error: 'This status change is not allowed.' }); return;
      }
      if (req.worker!.role !== 'manager' && row.assigned_worker_id !== req.worker!.id) {
        await client.query('ROLLBACK'); res.status(403).json({ error: 'Claim this order before updating it.' }); return;
      }
      await client.query('UPDATE orders SET status = $1, version = version + 1, updated_at = now() WHERE id = $2', [status, req.params.id]);
      await client.query(`INSERT INTO order_events(order_id, actor_worker_id, event_type, from_status, to_status)
        VALUES ($1,$2,'status_changed',$3,$4)`, [req.params.id, req.worker!.id, row.status, status]);
      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
    finally { client.release(); }
  } catch (error) { handleError(error, res); }
});

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => handleError(error, res);
app.use(errorMiddleware);
export default app;
