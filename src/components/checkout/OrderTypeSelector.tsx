import { MapPin, ShoppingBag, Utensils } from 'lucide-react';
import type { Order } from '../../types';

type Mode = Order['mode'];
const modes = [
  { id: 'dinein', label: 'Dine-in', bengali: 'টেবিলে বসে', Icon: Utensils },
  { id: 'takeaway', label: 'Takeaway', bengali: 'সঙ্গে নিয়ে যান', Icon: ShoppingBag },
  { id: 'delivery', label: 'Delivery', bengali: 'বাড়িতে পৌঁছে দিই', Icon: MapPin },
] as const;

export function OrderTypeSelector({ value, onChange, compact = false }: { value: Mode; onChange: (mode: Mode) => void; compact?: boolean }) {
  return <div className={`mode-grid ${compact ? 'compact-modes' : ''}`} role="group" aria-label="Order type">{modes.map(({ id, label, bengali, Icon }) => <button type="button" key={id} className={value === id ? 'mode selected' : 'mode'} aria-pressed={value === id} onClick={() => onChange(id)}><Icon size={20}/><strong>{label}</strong><span>{bengali}</span></button>)}</div>;
}
