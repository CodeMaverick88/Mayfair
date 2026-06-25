// client-side snippet (RoomDetail with invoice modal + stripe redirect)
// Put near your RoomDetail component in a client file (e.g., components/RoomDetailClient.tsx)
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { TOKENS, formatKsh } from '@/lib/ui-tokens';
type Room = {
  id: string;
  name: string;
  price: number;
  images: string[];
  amenities: string[];
};

declare global {
  interface Window { /* nothing additional */ }
}

// Ensure publishable key is available
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function nightsBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  const days = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  return days;
}

// amenity price map — extend as needed; you can also have amenities with zero price
const AMENITY_PRICES: Record<string, number> = {
  breakfast: 1200,
  'extra-bed': 3000,
  'spa-package': 4500,
  minibar: 800,
  late_checkout: 1500,
};

export default function RoomDetailWithPayment({ room }: { room: Room }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // init amenity map
    const initial: Record<string, boolean> = {};
    room.amenities.forEach(a => { initial[a] = false; });
    setSelectedAmenities(initial);
  }, [room]);

  const nights = useMemo(() => nightsBetween(start, end), [start, end]);

  const roomTotal = useMemo(() => (room.price || 0) * Math.max(1, nights || 1), [room.price, nights]);

  const amenitiesTotal = useMemo(() => {
    let t = 0;
    for (const a of Object.keys(selectedAmenities)) {
      if (selectedAmenities[a]) t += (AMENITY_PRICES[a] ?? 0);
    }
    return t;
  }, [selectedAmenities]);

  const total = useMemo(() => roomTotal + amenitiesTotal, [roomTotal, amenitiesTotal]);

  const toggleAmenity = (key: string) => setSelectedAmenities(s => ({ ...s, [key]: !s[key] }));

  // Build items array for invoice
  const invoiceItems = useMemo(() => {
    const items: { label: string; amount: number }[] = [];
    items.push({ label: `${room.name} × ${Math.max(1, nights || 1)} night(s)`, amount: roomTotal });
    for (const a of Object.keys(selectedAmenities)) {
      if (selectedAmenities[a]) items.push({ label: a.replace(/_/g, ' '), amount: AMENITY_PRICES[a] ?? 0 });
    }
    return items;
  }, [room.name, nights, selectedAmenities, roomTotal]);

  const openInvoice = () => {
    if (!start || !end) {
      setError('Please choose check-in and check-out dates before continuing.');
      return;
    }
    if (nights <= 0) { setError('Check-out date must be after check-in date.'); return; }
    setError(null);
    setInvoiceOpen(true);
  };

  const createCheckout = useCallback(async (customerName: string, customerEmail: string) => {
    setProcessing(true);
    setError(null);
    try {
      const payload = {
        roomId: room.id,
        startDate: start,
        endDate: end,
        guests,
        name: customerName,
        email: customerEmail,
        items: invoiceItems,
        total,
      };
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed creating checkout session');
      }
      const body = await res.json();
      const sessionId = body.sessionId as string | undefined;
      const sessionUrl = body.url as string | undefined;
      // Prefer using stripe.redirectToCheckout if sessionId present
      const stripe = await stripePromise;
      if (sessionId && stripe) {
        const { error } = await (stripe as any).redirectToCheckout({ sessionId });
        if (error) throw error;
      } else if (sessionUrl) {
        // fallback redirect
        window.location.href = sessionUrl;
      } else {
        throw new Error('No session returned from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Payment initiation failed.');
      setProcessing(false);
    }
  }, [room.id, start, end, guests, invoiceItems, total]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Check-in
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Check-out
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Guests
          <input type="number" value={guests} min={1} onChange={e => setGuests(Number(e.target.value || 1))} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>Select services (adds to invoice):</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {room.amenities.map(a => (
            <button key={a} onClick={() => toggleAmenity(a)} style={{ padding: '8px 12px', borderRadius: 8, border: selectedAmenities[a] ? `2px solid ${TOKENS.gold}` : '1px solid rgba(255,255,255,0.08)', background: selectedAmenities[a] ? 'rgba(229,196,148,0.06)' : 'transparent' }}>
              {a} {AMENITY_PRICES[a] ? ` (${formatKsh(AMENITY_PRICES[a])})` : ''}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        <button onClick={openInvoice} style={{ padding: '10px 14px', borderRadius: 10, background: TOKENS.crimson, color: '#fff' }}>Proceed to invoice</button>
      </div>

      {/* Invoice modal */}
      {invoiceOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setInvoiceOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ width: 'min(720px, 96vw)', borderRadius: 12, overflow: 'hidden', background: '#0b0a0d', color: '#fff', padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Invoice</h3>
            <div>
              {invoiceItems.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>{it.label}</div>
                  <div>{formatKsh(it.amount)}</div>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <div>Total</div>
                <div>{formatKsh(total)}</div>
              </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); const name = String(fd.get('name') || ''); const email = String(fd.get('email') || ''); createCheckout(name, email); }} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>Full name<input name="name" required style={{ padding: 8, borderRadius: 8 }} /></label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>Email<input name="email" type="email" required style={{ padding: 8, borderRadius: 8 }} /></label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" disabled={processing} style={{ padding: '10px 12px', borderRadius: 10, background: TOKENS.crimson, color: '#fff' }}>{processing ? 'Redirecting…' : 'Pay with card'}</button>
                <button onClick={() => { /* placeholder for M-Pesa (future) */ alert('M-Pesa payment coming soon'); }} type="button" style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>Pay with M-Pesa (coming)</button>
              </div>
              {error && <div style={{ color: 'salmon' }}>{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function useCallback(
  callback: (customerName: string, customerEmail: string) => Promise<void>,
  deps: (string | number | { label: string; amount: number }[])[],
): (customerName: string, customerEmail: string) => Promise<void> {
  return callback;
}
