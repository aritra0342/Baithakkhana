import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getCatalogItem } from '../../shared/catalog';
import type { CartItem, Order } from '../../src/types';
import { cartKey, priceFor, totalsFor } from '../../src/lib/cartLogic';

const selectionSchema = z.record(z.string().max(60), z.string().max(60));
export const orderSchema = z.strictObject({
  clientRequestId: z.uuid(),
  mode: z.enum(['dinein', 'takeaway', 'delivery']),
  details: z.strictObject({
    table: z.string().trim().max(30).optional(),
    name: z.string().trim().max(80).optional(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(400).optional(),
    landmark: z.string().trim().max(120).optional(),
    pickup: z.string().trim().max(120).optional(),
    instructions: z.string().trim().max(500).optional(),
  }),
  paymentMethod: z.enum(['counter', 'cash_on_delivery', 'demo_online']),
  items: z.array(z.strictObject({
    itemId: z.string().min(1).max(80),
    quantity: z.number().int().min(1).max(25),
    customizations: selectionSchema,
  })).min(1).max(30),
});
export type OrderInput = z.infer<typeof orderSchema>;

export class InvalidOrder extends Error {}

const validPhone = (phone: string) => {
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits);
};

export function prepareOrder(input: OrderInput) {
  const { mode, details, paymentMethod } = input;
  if (mode === 'dinein' && !details.table) throw new InvalidOrder('Table number is required.');
  if (mode !== 'dinein' && (!details.name || !details.phone)) throw new InvalidOrder('Name and phone are required.');
  if (mode === 'delivery' && !details.address) throw new InvalidOrder('Delivery address is required.');
  if (details.phone && !validPhone(details.phone)) throw new InvalidOrder('Enter a valid Indian mobile number.');
  if (mode === 'delivery' && paymentMethod === 'counter') throw new InvalidOrder('Select cash on delivery or demo payment.');
  if (mode !== 'delivery' && paymentMethod === 'cash_on_delivery') throw new InvalidOrder('Cash on delivery is only for delivery orders.');

  const items: CartItem[] = input.items.map(line => {
    const item = getCatalogItem(line.itemId);
    if (!item) throw new InvalidOrder(`Unknown menu item: ${line.itemId}`);
    const groups = item.customizations ?? [];
    if (Object.keys(line.customizations).length !== groups.length) throw new InvalidOrder(`Choose all customizations for ${item.en}.`);
    for (const group of groups) {
      if (!group.options.some(option => option.id === line.customizations[group.id])) {
        throw new InvalidOrder(`Invalid customization for ${item.en}.`);
      }
    }
    return {
      key: cartKey(item.id, line.customizations),
      itemId: item.id,
      quantity: line.quantity,
      customizations: line.customizations,
      unitPrice: priceFor(item, line.customizations),
    };
  });
  if (items.reduce((sum, item) => sum + item.quantity, 0) > 60) throw new InvalidOrder('Please place a smaller order.');
  const totals = totalsFor(items, mode as Order['mode']);
  const allowedDetails = mode === 'dinein' ? ['table', 'name', 'instructions'] :
    mode === 'takeaway' ? ['name', 'phone', 'pickup', 'instructions'] :
      ['name', 'phone', 'address', 'landmark', 'instructions'];
  const storedDetails = Object.fromEntries(Object.entries(details).filter(([key, value]) => allowedDetails.includes(key) && Boolean(value)));
  return { items, totals, storedDetails };
}

export function newOrderId() {
  return `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomBytes(5).toString('hex').toUpperCase()}`;
}

export const nextStatuses = {
  received: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
} as const;
