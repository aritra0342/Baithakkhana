import { describe, expect, it } from 'vitest';
import { getItem, menu } from '../data/menu';
import { addLine, cartKey, getItemCount, getSubtotal, priceFor, totalsFor, updateLine } from './cartLogic';
import { filterMenu } from './filterMenu';
import { validIndianPhone, validateCheckout } from './validation';

const tea = getItem('matir-bhar-cha')!;
const singara = getItem('singara')!;

describe('cart and customization pricing', () => {
  it('keeps different sugar configurations on separate lines and merges identical ones', () => {
    let lines = addLine([], tea, { size: 'regular', sugar: 'regular' }, 1);
    lines = addLine(lines, tea, { sugar: 'regular', size: 'regular' }, 2);
    lines = addLine(lines, tea, { size: 'regular', sugar: 'none' }, 1);
    expect(lines).toHaveLength(2);
    expect(lines.map(line => line.quantity)).toEqual([3, 1]);
    expect(cartKey(tea.id, { size: 'large', sugar: 'none' })).toBe(cartKey(tea.id, { sugar: 'none', size: 'large' }));
  });

  it('calculates unit and line prices in integer paise', () => {
    expect(tea.price).toBe(9000);
    expect(priceFor(tea, { size: 'large', sugar: 'less' })).toBe(12000);
    let lines = addLine([], tea, { size: 'large', sugar: 'less' }, 2);
    lines = addLine(lines, singara, {}, 1);
    expect(getItemCount(lines)).toBe(3);
    expect(getSubtotal(lines)).toBe(31000);
    const key = lines[0].key;
    lines = updateLine(lines, key, 1);
    expect(getSubtotal(lines)).toBe(19000);
    lines = updateLine(lines, key, 0);
    expect(lines).toHaveLength(1);
  });

  it('applies only the appropriate packaging and delivery fees', () => {
    const lines = [{ key: 'singara|', itemId: 'singara', quantity: 1, customizations: {}, unitPrice: singara.price }];
    expect(totalsFor(lines, 'dinein').total).toBe(7000);
    expect(totalsFor(lines, 'takeaway').total).toBe(9500);
    expect(totalsFor(lines, 'delivery').total).toBe(14500);
  });
});

describe('menu filtering and checkout validation', () => {
  it('searches Bengali and English names and respects filters', () => {
    expect(filterMenu(menu, { query: 'সিঙ্গারা' }).map(item => item.id)).toEqual(['singara']);
    expect(filterMenu(menu, { query: 'TEA', category: 'tea' }).length).toBeGreaterThan(0);
    expect(filterMenu(menu, { vegetarian: true }).every(item => item.veg)).toBe(true);
    expect(filterMenu(menu, { bestsellers: true }).every(item => item.bestseller)).toBe(true);
  });

  it('accepts formatted Indian mobile numbers and rejects missing delivery details', () => {
    expect(validIndianPhone('+91 98765 43210')).toBe(true);
    expect(validIndianPhone('98765-43210')).toBe(true);
    expect(validIndianPhone('12345 67890')).toBe(false);
    expect(validateCheckout('delivery', { name: 'Aritra', phone: '98765 43210' })).toEqual({ address: 'This field is required' });
  });
});
