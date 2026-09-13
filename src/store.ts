import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getItem } from './data/menu';
import type { CartItem, MenuItem, Order, Totals } from './types';
import { addLine, cartKey, priceFor, totalsFor, updateLine } from './lib/cartLogic';
export { cartKey, priceFor, getItemCount, getSubtotal, totalsFor } from './lib/cartLogic';

type OrderMode = Order['mode'];

type State = {
  items: CartItem[];
  mode: OrderMode;
  orders: Order[];
  lastOrder?: string;
  setMode: (mode: OrderMode) => void;
  add: (item: MenuItem, customizations: Record<string, string>, quantity: number) => void;
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  createOrder: (mode: OrderMode, details: Record<string, string>) => string;
  recordRemoteOrder: (order: Order) => void;
};

export const useStore = create<State>()(persist((set, get) => ({
  items: [],
  mode: 'dinein',
  orders: [],
  setMode: mode => set({ mode }),
  add: (item, customizations, quantity) => {
    set(state => ({ items: addLine(state.items, item, customizations, quantity) }));
  },
  update: (key, quantity) => set(state => ({ items: updateLine(state.items, key, quantity) })),
  remove: key => set(state => ({ items: state.items.filter(line => line.key !== key) })),
  clear: () => set({ items: [] }),
  createOrder: (mode, details) => {
    const items = get().items.map(line => ({ ...line, customizations: { ...line.customizations } }));
    if (!items.length) throw new Error('Cannot create an empty order');
    const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), value => (value % 36).toString(36)).join('').toUpperCase();
    const id = `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${suffix}`;
    const order: Order = { id, items, mode, details: { ...details }, totals: totalsFor(items, mode), createdAt: Date.now(), source: 'demo' };
    set(state => ({ orders: [...state.orders, order], lastOrder: id, items: [] }));
    return id;
  },
  recordRemoteOrder: order => set(state => ({ orders: [...state.orders.filter(previous => previous.id !== order.id), { ...order, source: 'server' }], lastOrder: order.id, items: [] })),
}), {
  name: 'boithokkhana-order',
  version: 2,
  migrate: persisted => {
    const previous = persisted as Partial<State>;
    return { ...previous, mode: previous.mode ?? 'dinein', items: (previous.items ?? []).flatMap(line => {
      const item = getItem(line.itemId);
      return item ? [{ ...line, key: cartKey(line.itemId, line.customizations), unitPrice: priceFor(item, line.customizations) }] : [];
    }) };
  },
}));

export const money = (paise: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(paise / 100);
