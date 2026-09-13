import { describe, expect, it } from 'vitest';
import { catalog } from '../../shared/catalog';
import { newOrderId, nextStatuses, orderSchema, prepareOrder } from './orderLogic';

const tea = catalog.find(item => item.customizations?.length);
if (!tea) throw new Error('Expected a configurable menu item');
const choices = Object.fromEntries((tea.customizations ?? []).map(group => [group.id, group.options[0].id]));

const input = {
  clientRequestId: '85aeacac-20a0-4261-8c43-47d49e51d04e',
  mode: 'dinein' as const,
  details: { table: 'A4' },
  paymentMethod: 'counter' as const,
  items: [{ itemId: tea.id, quantity: 2, customizations: choices }],
};

describe('server order rules', () => {
  it('calculates prices from the shared catalogue', () => {
    const result = prepareOrder(orderSchema.parse(input));
    expect(result.items[0].unitPrice).toBe(tea.price + (tea.customizations ?? []).reduce((sum, group) =>
      sum + group.options[0].delta, 0));
    expect(result.totals.total).toBe(result.items[0].unitPrice * 2);
    expect(result.storedDetails).toEqual({ table: 'A4' });
  });
  it('rejects unknown dishes, unrecognised options, and missing table', () => {
    expect(() => prepareOrder(orderSchema.parse({ ...input, items: [{ ...input.items[0], itemId: 'fake' }] }))).toThrow('Unknown menu item');
    expect(() => prepareOrder(orderSchema.parse({ ...input, items: [{ ...input.items[0], customizations: { ...choices, [tea.customizations![0].id]: 'fake' } }] }))).toThrow('Invalid customization');
    expect(() => prepareOrder(orderSchema.parse({ ...input, details: {} }))).toThrow('Table number');
    expect(() => orderSchema.parse({ ...input, items: [{ ...input.items[0], unitPrice: 1 }] })).toThrow();
  });
  it('accepts only intended transitions', () => {
    expect(nextStatuses.received).toContain('preparing');
    expect(nextStatuses.ready).not.toContain('preparing');
    expect(nextStatuses.completed).toHaveLength(0);
    expect(newOrderId()).toMatch(/^BK-\d{6}-[A-F0-9]{10}$/);
  });
});
