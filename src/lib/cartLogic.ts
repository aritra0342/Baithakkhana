import type { CartItem, MenuItem, Order, Totals } from '../types';

export function cartKey(itemId: string, customizations: Record<string, string>) {
  return `${itemId}|${Object.entries(customizations).sort(([a], [b]) => a.localeCompare(b)).map(([group, option]) => `${group}:${option}`).join(',')}`;
}

export function priceFor(item: Pick<MenuItem, 'price' | 'customizations'>, selections: Record<string, string>) {
  return item.price + (item.customizations ?? []).reduce((sum, group) =>
    sum + (group.options.find(option => option.id === selections[group.id])?.delta ?? 0), 0);
}

export function addLine(items: CartItem[], item: MenuItem, customizations: Record<string, string>, quantity: number) {
  if (quantity < 1) return items;
  const selections = { ...customizations };
  const key = cartKey(item.id, selections);
  return items.some(line => line.key === key)
    ? items.map(line => line.key === key ? { ...line, quantity: line.quantity + quantity } : line)
    : [...items, { key, itemId: item.id, quantity, customizations: selections, unitPrice: priceFor(item, selections) }];
}

export function updateLine(items: CartItem[], key: string, quantity: number) {
  return quantity > 0
    ? items.map(line => line.key === key ? { ...line, quantity } : line)
    : items.filter(line => line.key !== key);
}

export function getItemCount(items: CartItem[]) { return items.reduce((count, item) => count + item.quantity, 0); }
export function getSubtotal(items: CartItem[]) { return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0); }

export function totalsFor(items: CartItem[], mode: Order['mode']): Totals {
  const subtotal = getSubtotal(items);
  const packaging = mode === 'dinein' ? 0 : 2500;
  const delivery = mode === 'delivery' ? 5000 : 0;
  const discount = 0;
  return { subtotal, packaging, delivery, discount, total: subtotal + packaging + delivery - discount };
}
