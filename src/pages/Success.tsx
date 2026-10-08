import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { getItem } from '../data/menu';
import { money, useStore } from '../store';
import { Art, Brand } from '../components';

export default function Success() {
  const { orderId } = useParams();
  const order = useStore(state => state.orders.find(item => item.id === orderId));
  if (!order) return <div className="state-page"><Art kind="fish"/><h1>এই অর্ডারটি খুঁজে পেলাম না</h1><p>নম্বরটি হয়তো ভুল হয়েছে, অথবা এই ডিভাইসে অর্ডারটির রসিদ আর নেই।</p><Link to="/" className="button button-dark">Back to Home</Link></div>;
  const preparationTime = Math.max(10, ...order.items.map(line => getItem(line.itemId)?.time ?? 10)) + 5;
  const demo = order.source !== 'server';
  const paymentLabel = order.details.payment === 'counter' ? 'Pay at Counter' : order.details.payment === 'cash_on_delivery' ? 'Cash on Delivery' : order.details.payment === 'demo_online' ? 'Demo Online Payment' : order.details.payment;
  return <div className="success"><Brand variant="success"/><div className="success-mark"><Check size={34}/></div><span className="eyebrow">Order received{demo ? ' · Demo' : ''}</span><h1>আপনার অর্ডারটি<br/><em>গ্রহণ করা হয়েছে।</em></h1><p>{demo ? 'Your demo order has been received.' : 'Your order is with the café team.'} এখন গল্প শুরু হোক।</p><div className="order-card"><div className="order-card-top"><span>Order number</span><strong>{order.id}</strong></div><div className="order-card-top"><span>{order.mode === 'dinein' ? 'Dine-in' : order.mode === 'takeaway' ? 'Takeaway' : 'Delivery'}</span><span>Est. {preparationTime} min</span></div>{order.items.map(line => <div className="order-row" key={line.key}><span>{line.quantity} × {getItem(line.itemId)?.bn ?? 'Item'}</span><b>{money(line.unitPrice * line.quantity)}</b></div>)}<div className="order-total"><span>{demo ? 'Demo total' : 'Total'} · {paymentLabel}</span><strong>{money(order.totals.total)}</strong></div></div><div className="success-actions"><Link to="/" className="button button-outline">Back to Home</Link><Link to="/menu" className="button button-terracotta">Order More <ArrowRight size={16}/></Link></div></div>;
}
