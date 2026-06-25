// lib/bookings-store.ts
import { randomUUID } from 'crypto';

export type Booking = {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  guests: number;
  name: string;
  email: string;
  items?: { label: string; amount: number }[];
  total?: number;
  status: 'pending_payment' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  stripeSessionId?: string;
  paidAt?: string;
};

const BOOKINGS = new Map<string, Booking>();

export async function createProvisionalBooking(data: {
  roomId: string;
  startDate: string;
  endDate: string;
  guests: number;
  name: string;
  email: string;
  items?: { label: string; amount: number }[];
  total?: number;
  status?: Booking['status'];
}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const b: Booking = {
    id,
    roomId: data.roomId,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: data.guests,
    name: data.name,
    email: data.email,
    items: data.items || [],
    total: data.total || 0,
    status: data.status ?? 'pending_payment',
    createdAt: now,
    updatedAt: now,
  };
  BOOKINGS.set(id, b);
  return b;
}

export async function getBookingById(id: string) {
  return BOOKINGS.get(id) ?? null;
}

export async function markBookingPaid(id: string, opts?: { stripeSessionId?: string; paidAt?: string }) {
  const b = BOOKINGS.get(id);
  if (!b) return null;
  b.status = 'paid';
  b.stripeSessionId = opts?.stripeSessionId ?? b.stripeSessionId;
  b.paidAt = opts?.paidAt ?? new Date().toISOString();
  b.updatedAt = new Date().toISOString();
  BOOKINGS.set(id, b);
  return b;
}

// Optional: for testing convenience
export async function listBookings() {
  return Array.from(BOOKINGS.values());
}