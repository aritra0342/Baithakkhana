import type { Order } from '../types';

export function validIndianPhone(value: string) {
  let digits = value.replace(/[^\d+]/g, '');
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits);
}

export function validateCheckout(mode: Order['mode'], details: Record<string, string>) {
  const required = mode === 'dinein' ? ['table'] : mode === 'takeaway' ? ['name', 'phone'] : ['name', 'phone', 'address'];
  const errors: Record<string, string> = {};
  required.forEach(key => { if (!details[key]?.trim()) errors[key] = 'This field is required'; });
  if (details.phone?.trim() && !validIndianPhone(details.phone)) errors.phone = 'Enter a valid Indian mobile number';
  return errors;
}
