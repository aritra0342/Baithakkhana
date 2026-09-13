import type { CartItem, Order, Totals } from '../src/types';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type WorkerRole = 'staff' | 'manager';
export type PaymentMethod = 'counter' | 'cash_on_delivery' | 'demo_online';

export type OrderReceipt = Order & {
  status: OrderStatus;
  paymentMethod: PaymentMethod;
};

export type StaffOrder = {
  id: string;
  mode: Order['mode'];
  status: OrderStatus;
  customerDetails: Record<string, string>;
  paymentMethod: PaymentMethod;
  totals: Totals;
  items: (CartItem & { nameBn: string; nameEn: string })[];
  assignedWorkerId: string | null;
  assignedWorkerName: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Worker = { id: string; displayName: string; email: string; role: WorkerRole };
