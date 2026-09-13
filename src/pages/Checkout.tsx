import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { totalsFor, useStore } from '../store';
import { Art } from '../components';
import { OrderTypeSelector } from '../components/checkout/OrderTypeSelector';
import { validateCheckout } from '../lib/validation';
import { Summary } from './Cart';

export default function Checkout() {
  const items = useStore(state => state.items);
  const mode = useStore(state => state.mode);
  const setMode = useStore(state => state.setMode);
  const createOrder = useStore(state => state.createOrder);
  const recordRemoteOrder = useStore(state => state.recordRemoteOrder);
  const navigate = useNavigate();
  const [details, setDetails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState('in-person');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const requestId = useRef<string | null>(null);

  if (!items.length) return <div className="state-page"><Art kind="fish"/><h1>আগে কিছু পছন্দ করুন</h1><p>খালি টেবিলে বিল হয় না — মেনু থেকে শুরু করুন।</p><Link className="button button-dark" to="/menu">Explore Menu</Link></div>;

  const totals = totalsFor(items, mode);
  const setField = (key: string, value: string) => {
    requestId.current = null;
    setDetails(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: '' }));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const next = validateCheckout(mode, details);
    if (Object.keys(next).length) { setErrors(next); return; }
    setSubmissionError('');
    if (import.meta.env.VITE_ORDER_MODE !== 'server') {
      const id = createOrder(mode, { ...details, payment: payment === 'demo-online' ? 'Demo Online Payment' : mode === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter' });
      navigate(`/order-success/${id}`);
      return;
    }
    setSubmitting(true);
    try {
      const clientRequestId = requestId.current ?? crypto.randomUUID();
      requestId.current = clientRequestId;
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientRequestId, mode, details,
          paymentMethod: payment === 'demo-online' ? 'demo_online' : mode === 'delivery' ? 'cash_on_delivery' : 'counter',
          items: items.map(({ itemId, quantity, customizations }) => ({ itemId, quantity, customizations })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not place your order. Please try again.');
      recordRemoteOrder(data.order);
      navigate(`/order-success/${data.order.id}`);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'We could not place your order. Please try again.');
    } finally { setSubmitting(false); }
  };

  return <div className="checkout"><Link className="back-link" to="/cart"><ArrowLeft size={16}/> Back to cart</Link><div className="checkout-grid"><form onSubmit={submit} noValidate><span className="eyebrow">ALMOST THERE</span><h1>আপনার টেবিল<br/>প্রস্তুত হচ্ছে।</h1><OrderTypeSelector value={mode} onChange={next => { requestId.current = null; setMode(next); setDetails({}); setErrors({}); setPayment('in-person'); }}/>
    {mode === 'dinein' ? <><Field label="Table number" name="table" value={details.table ?? ''} set={setField} error={errors.table} placeholder="e.g. A4"/><Field label="Your name (optional)" name="name" value={details.name ?? ''} set={setField} placeholder="What should we call you?"/></> : <><Field label="Your name" name="name" value={details.name ?? ''} set={setField} error={errors.name} placeholder="What should we call you?"/><Field label="Phone number" name="phone" value={details.phone ?? ''} set={setField} error={errors.phone} placeholder="10-digit mobile number" type="tel"/>{mode === 'delivery' ? <><Field label="Full address" name="address" value={details.address ?? ''} set={setField} error={errors.address} placeholder="House, street, locality"/><Field label="Landmark (optional)" name="landmark" value={details.landmark ?? ''} set={setField} placeholder="Near..."/></> : <Field label="Pickup preference (optional)" name="pickup" value={details.pickup ?? ''} set={setField} placeholder="e.g. Around 5 PM"/>}</>}
    <Field label="Any instructions? (optional)" name="instructions" value={details.instructions ?? ''} set={setField} placeholder="Tell us what would make it just right"/>
    <fieldset className="payment"><legend>Payment</legend><label><input type="radio" name="payment" value="in-person" checked={payment === 'in-person'} onChange={() => { requestId.current = null; setPayment('in-person'); }}/> {mode === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}</label><label><input type="radio" name="payment" value="demo-online" checked={payment === 'demo-online'} onChange={() => { requestId.current = null; setPayment('demo-online'); }}/> Demo Online Payment</label><small>Demo online payment does not collect money. Confirm real payment with the café.</small></fieldset>{submissionError && <p className="checkout-error" role="alert">{submissionError}</p>}<button className="button button-terracotta full" type="submit" disabled={submitting}>{submitting ? 'Placing order…' : import.meta.env.VITE_ORDER_MODE === 'server' ? 'Place Order' : 'Place Demo Order'} <Check size={16}/></button>
  </form><Summary totals={totals} checkout={false}/></div></div>;
}

function Field({ label, name, value, set, error, placeholder, type = 'text' }: { label: string; name: string; value: string; set: (name: string, value: string) => void; error?: string; placeholder: string; type?: string }) {
  return <label className="field">{label}<input aria-describedby={error ? `${name}-error` : undefined} aria-invalid={!!error} name={name} type={type} value={value} onChange={event => set(name, event.target.value)} placeholder={placeholder}/>{error && <small id={`${name}-error`} role="alert">{error}</small>}</label>;
}
