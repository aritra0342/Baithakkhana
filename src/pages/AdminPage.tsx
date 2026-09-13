import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChefHat, Clock3, Coffee, LogOut, RefreshCw, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OrderStatus, StaffOrder, Worker } from '../../shared/contracts';
import { Brand } from '../components/brand/Brand';
import { money } from '../store';
import './admin.css';

type Screen = 'loading' | 'setup' | 'login' | 'queue';
type Filter = 'all' | 'mine' | OrderStatus;

const statusNames: Record<OrderStatus, string> = {
  received: 'New', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
};
const modeNames = { dinein: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' };
const actionNames: Partial<Record<OrderStatus, string>> = { preparing: 'Start preparing', ready: 'Mark ready', completed: 'Complete order' };
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { received: 'preparing', preparing: 'ready', ready: 'completed' };
const timeFor = (value: string) => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(value));

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers } });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || `Request failed (${response.status}).`), { status: response.status });
  return data as T;
}

export default function AdminPage() {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState<Screen>('loading');
  const [worker, setWorker] = useState<Worker | null>(null);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      const result = await api<{ orders: StaffOrder[] }>('/api/admin/orders');
      setOrders(result.orders);
      setLastUpdated(new Date());
      setError('');
    } catch (cause) {
      if ((cause as { status?: number }).status === 401) { setWorker(null); setScreen('login'); }
      else setError(cause instanceof Error ? cause.message : 'Could not refresh orders.');
    } finally { if (!quiet) setBusy(false); }
  }, []);

  useEffect(() => {
    let active = true;
    api<{ worker: Worker | null }>('/api/admin/session').then(result => {
      if (!active) return;
      setWorker(result.worker);
      setScreen(result.worker ? 'queue' : 'login');
    }).catch(cause => {
      if (!active) return;
      setScreen((cause as { status?: number }).status === 503 ? 'setup' : 'login');
      if ((cause as { status?: number }).status !== 503) setError('The order service is not responding. Start the API server, then retry.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (screen !== 'queue') return;
    void refresh(true);
    const timer = window.setInterval(() => void refresh(true), 10_000);
    return () => window.clearInterval(timer);
  }, [screen, refresh]);

  const visible = useMemo(() => orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'mine') return order.assignedWorkerId === worker?.id;
    return order.status === filter;
  }), [orders, filter, worker?.id]);
  const selected = visible.find(order => order.id === selectedId) ?? visible[0];
  const counts = useMemo(() => ({
    received: orders.filter(order => order.status === 'received').length,
    preparing: orders.filter(order => order.status === 'preparing').length,
    ready: orders.filter(order => order.status === 'ready').length,
  }), [orders]);

  const act = async (order: StaffOrder, action: 'claim' | OrderStatus) => {
    setBusy(true); setError('');
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.id)}/${action === 'claim' ? 'claim' : 'status'}`, {
        method: action === 'claim' ? 'POST' : 'PATCH',
        body: JSON.stringify(action === 'claim' ? { version: order.version } : { status: action, version: order.version }),
      });
      await refresh(true);
    } catch (cause) {
      await refresh(true);
      setError(cause instanceof Error ? cause.message : 'Could not update this order.');
    } finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    try { await api('/api/admin/logout', { method: 'POST' }); setWorker(null); setOrders([]); setScreen('login'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign out.'); }
    finally { setBusy(false); }
  };

  if (screen !== 'queue') return <div className="admin-gate">
    <div className="admin-gate-brand"><Brand variant="header"/><span>STAFF WORKSPACE</span></div>
    <motion.div className="admin-gate-card" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
      <span className="admin-gate-symbol"><Coffee size={29}/></span>
      {screen === 'loading' ? <><span className="admin-kicker">CONNECTING</span><h1>Opening the order desk.</h1><p>Checking your staff session…</p></> :
      screen === 'setup' ? <><span className="admin-kicker">SETUP REQUIRED</span><h1>The order desk is waiting for Neon.</h1><p>Add your Neon connection string to the server’s <code>.env</code>, run the migration, create a worker account, and restart the API. The customer site remains in demo mode until connected ordering is enabled.</p><button className="admin-primary" onClick={() => window.location.reload()}>Check again <RefreshCw size={16}/></button></> :
      <Login onSuccess={next => { setWorker(next); setScreen('queue'); setError(''); }}/>
      }
      {error && <p className="admin-alert" role="alert">{error}</p>}
    </motion.div>
    <Link className="admin-back" to="/"><ArrowLeft size={16}/> Back to café</Link>
  </div>;

  return <div className="admin-shell">
    <aside className="admin-rail">
      <div className="admin-rail-top"><Brand variant="footer"/><span>ORDER DESK <i>•</i> STAFF</span></div>
      <div className="admin-rail-intro"><span>বৈঠকখানা</span><h2>Every order,<br/><em>beautifully in hand.</em></h2><p>A calmer way to keep the café moving.</p></div>
      <nav aria-label="Order filters" className="admin-filters">
        {(['all', 'received', 'preparing', 'ready', 'mine', 'completed', 'cancelled'] as Filter[]).map(item =>
          <button key={item} className={filter === item ? 'active' : ''} onClick={() => { setFilter(item); setSelectedId(null); }}>
            <span>{item === 'all' ? 'All orders' : item === 'mine' ? 'Assigned to me' : statusNames[item]}</span>
            {item in counts && <b>{counts[item as keyof typeof counts]}</b>}
          </button>)}
      </nav>
      <div className="admin-rail-bottom"><div className="admin-person"><span>{worker?.displayName.charAt(0).toUpperCase()}</span><div><strong>{worker?.displayName}</strong><small>{worker?.role === 'manager' ? 'Manager' : 'Cafe staff'}</small></div></div><button onClick={logout} disabled={busy} aria-label="Sign out"><LogOut size={17}/></button></div>
    </aside>
    <main className="admin-main">
      <div className="admin-topline"><span><span className="admin-live-dot"/> LIVE ORDER QUEUE</span><div><span>{lastUpdated ? `Updated ${timeFor(lastUpdated.toISOString())}` : 'Connecting…'}</span><button onClick={() => void refresh()} disabled={busy} aria-label="Refresh orders"><RefreshCw size={18}/></button></div></div>
      <div className="admin-heading"><div><span className="admin-kicker">THE CAFÉ, IN MOTION</span><h1>The order queue<span>.</span></h1><p>From the first cup to the last table.</p></div><div className="admin-date"><strong>{new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(new Date())}</strong><span>{new Intl.DateTimeFormat('en-IN', { month: 'long', weekday: 'long' }).format(new Date())}</span></div></div>
      <div className="admin-stats"><div><span>01 / NEW</span><strong>{counts.received.toString().padStart(2, '0')}</strong><small>Waiting to be picked up</small></div><div><span>02 / IN KITCHEN</span><strong>{counts.preparing.toString().padStart(2, '0')}</strong><small>Being made with care</small></div><div><span>03 / READY</span><strong>{counts.ready.toString().padStart(2, '0')}</strong><small>Ready for the guest</small></div></div>
      {error && <div className="admin-banner" role="alert"><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
      <div className="admin-workspace"><section className="admin-list" aria-label="Orders"><div className="admin-section-head"><div><span className="admin-kicker">ORDER TICKETS</span><h2>{filter === 'all' ? 'The whole queue' : filter === 'mine' ? 'Assigned to me' : statusNames[filter]}</h2></div><span>{visible.length} shown</span></div>
        {visible.length ? <div className="admin-tickets">{visible.map((order, index) => <motion.button key={order.id} className={`admin-ticket ${selected?.id === order.id ? 'selected' : ''}`} onClick={() => setSelectedId(order.id)} initial={reduced ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: Math.min(index, 8) * .035 }}>
          <div className="admin-ticket-top"><span className={`admin-status ${order.status}`}>{statusNames[order.status]}</span><time>{timeFor(order.createdAt)}</time></div><strong>{order.id}</strong><span className="admin-ticket-summary">{modeNames[order.mode]} <i>•</i> {order.customerDetails.name || (order.customerDetails.table ? `Table ${order.customerDetails.table}` : 'Guest')}</span><div className="admin-ticket-bottom"><span>{order.items.reduce((sum, line) => sum + line.quantity, 0)} items</span><b>{money(order.totals.total)}</b><ArrowRight size={17}/></div>
        </motion.button>)}</div> : <div className="admin-empty"><Coffee size={38}/><h3>Nothing on this tray yet.</h3><p>New orders will appear here automatically.</p></div>}
      </section><section className="admin-detail" aria-label="Selected order"><div className="admin-detail-cap"><span>ORDER DETAILS</span><span>STAFF COPY</span></div>{selected ? <><div className="admin-detail-body"><div className="admin-detail-lead"><span className={`admin-status ${selected.status}`}>{statusNames[selected.status]}</span><time>{timeFor(selected.createdAt)}</time></div><h2>{selected.id}</h2><p className="admin-detail-mode">{modeNames[selected.mode]} order <i>•</i> {selected.assignedWorkerName ? `With ${selected.assignedWorkerName}` : 'Unassigned'}</p>
        <div className="admin-detail-rule"/><div className="admin-detail-label">THE ORDER</div><div className="admin-detail-items">{selected.items.map(line => <div key={line.key}><span><b>{line.quantity}×</b><span><strong>{line.nameBn}</strong><small>{line.nameEn}{Object.values(line.customizations).length ? ` · ${Object.values(line.customizations).join(', ')}` : ''}</small></span></span><b>{money(line.quantity * line.unitPrice)}</b></div>)}</div>
        <div className="admin-detail-total"><span>Total</span><strong>{money(selected.totals.total)}</strong></div><div className="admin-detail-rule"/><div className="admin-detail-label">GUEST & FULFILMENT</div><dl className="admin-guest"><div><dt>Payment</dt><dd>{selected.paymentMethod === 'demo_online' ? 'Demo online — collect payment' : selected.paymentMethod === 'cash_on_delivery' ? 'Cash on delivery' : 'Pay at counter'}</dd></div>{Object.entries(selected.customerDetails).filter(([, value]) => Boolean(value)).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      </div><div className="admin-detail-actions">
        {!selected.assignedWorkerId && selected.status !== 'cancelled' && selected.status !== 'completed' && <button className="admin-secondary" onClick={() => void act(selected, 'claim')} disabled={busy}><UserRoundCheck size={16}/> Claim this order</button>}
        {nextStatus[selected.status] && <button className="admin-primary" onClick={() => void act(selected, nextStatus[selected.status]!)} disabled={busy || (worker?.role !== 'manager' && selected.assignedWorkerId !== worker?.id)}>{selected.status === 'received' ? <ChefHat size={16}/> : selected.status === 'preparing' ? <Clock3 size={16}/> : <Check size={16}/>} {actionNames[nextStatus[selected.status]!]}</button>}
        {worker?.role === 'manager' && !['completed', 'cancelled'].includes(selected.status) && <button className="admin-cancel" onClick={() => void act(selected, 'cancelled')} disabled={busy}>Cancel order</button>}
        {worker?.role !== 'manager' && selected.assignedWorkerId !== worker?.id && selected.assignedWorkerId && <p className="admin-action-note"><ShieldCheck size={15}/> Assigned to another worker.</p>}
      </div></> : <div className="admin-detail-placeholder"><Coffee size={34}/><p>Select an order to see its details.</p></div>}</section></div>
    </main>
  </div>;
}

function Login({ onSuccess }: { onSuccess: (worker: Worker) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await api<{ worker: Worker }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onSuccess(result.worker);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  };
  return <><span className="admin-kicker">STAFF ACCESS ONLY</span><h1>Come on in, the orders are waiting.</h1><p>Sign in with your café worker account to manage the queue.</p><form className="admin-login" onSubmit={submit}><label>Email address<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required/></label>{error && <p className="admin-alert" role="alert">{error}</p>}<button className="admin-primary" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Open order desk'} <ArrowRight size={16}/></button></form></>;
}
