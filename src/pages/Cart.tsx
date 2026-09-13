import { Link } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import { getItem } from '../data/menu';
import { money, totalsFor, useStore } from '../store';
import { Art, Quantity, SectionTitle } from '../components';
import { OrderTypeSelector } from '../components/checkout/OrderTypeSelector';
import type { Totals } from '../types';

export default function Cart() {
  const items = useStore(state => state.items);
  const mode = useStore(state => state.mode);
  const setMode = useStore(state => state.setMode);
  const update = useStore(state => state.update);
  const remove = useStore(state => state.remove);
  const clear = useStore(state => state.clear);
  const totals = totalsFor(items, mode);

  if (!items.length) return <div className="state-page cart-empty"><Art kind="lotus"/><h1>Your cart is waiting<br/>for something delicious.</h1><p>এক কাপ চা দিয়ে শুরু হোক?</p><Link to="/menu" className="button button-terracotta">Explore Menu <ArrowRight size={16}/></Link></div>;

  return <div className="cart-page"><SectionTitle as="h1" eyebrow="YOUR TABLE" title="আপনার অর্ডার" sub="ভালো জিনিস একটু সময় নিয়ে বেছে নেওয়া যায়।"/><div className="cart-layout"><div className="cart-lines"><div className="cart-mode"><h2>How will you enjoy it?</h2><OrderTypeSelector value={mode} onChange={setMode} compact/></div>
    {items.map(line => {
      const item = getItem(line.itemId)!;
      return <article className="cart-line" key={line.key}><img src={item.image} alt=""/><div className="cart-line-copy"><h3>{item.bn}</h3><span>{item.en}</span>{Object.entries(line.customizations).map(([groupId, optionId]) => {
        const group = item.customizations?.find(group => group.id === groupId);
        const option = group?.options.find(option => option.id === optionId);
        return <small key={groupId}>{group?.label ?? groupId}: {option?.label ?? optionId}</small>;
      })}<div><Quantity value={line.quantity} onChange={quantity => update(line.key, quantity)}/></div></div><strong>{money(line.unitPrice * line.quantity)}</strong><button className="icon-button delete" onClick={() => remove(line.key)} aria-label={`Remove ${item.en}`}><Trash2 size={17}/></button></article>;
    })}<button className="text-link clear" onClick={clear}>Clear your order</button></div><Summary totals={totals}/></div></div>;
}

export function Summary({ totals, checkout = true }: { totals: Totals; checkout?: boolean }) {
  return <aside className="summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(totals.subtotal)}</b></div><div><span>Packaging</span><b>{money(totals.packaging)}</b></div><div><span>Delivery</span><b>{money(totals.delivery)}</b></div><div className="summary-total"><span>{import.meta.env.VITE_ORDER_MODE === 'server' ? 'Total' : 'Demo total'}</span><strong>{money(totals.total)}</strong></div>{checkout && <Link to="/checkout" className="button button-dark full">Proceed to Checkout <ArrowRight size={16}/></Link>}</aside>;
}
