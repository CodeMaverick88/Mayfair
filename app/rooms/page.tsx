'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * RoomsPage.tsx (client)
 *
 * Drop into app/rooms/page.tsx or components/RoomsPage.tsx and render.
 *
 * Backend endpoints (replace with your real endpoints):
 *  - GET /api/rooms?query=&minPrice=&maxPrice=&amenities=&sort=&page=
 *  - POST /api/availability  { roomId, startDate, endDate }
 *  - POST /api/book          { roomId, startDate, endDate, guests, name, email }
 *
 * Important: add your real image files to /public and update room.image fields if desired.
 *
 * Lots of comments and structure so you can extend easily.
 */

/* ============================
   Design tokens & helpers
   ============================ */
const TOKENS = {
  bg: '#070308',
  text: '#ffffff',
  gold: '#E5C494',
  crimson: '#6D001A',
  ease: 'cubic-bezier(.16,1,.3,1)'
};

function formatKsh(amount: number | string) {
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, '')) || 0;
  return `Ksh ${n.toLocaleString('en-KE')}`;
}

function encodePath(p?: string) {
  if (!p) return '/placeholder.jpg';
  try { return encodeURI(p); } catch { return p; }
}

/* ============================
   Types
   ============================ */
type Room = {
  id: string;
  name: string;
  slug?: string;
  price: number; // per night in Ksh
  images: string[];
  shortDesc?: string;
  longDesc?: string;
  guests: number;
  bedrooms?: number;
  amenities: string[]; // e.g., ['wifi', 'breakfast', 'spa']
  rating?: number;
  badge?: string;
  type?: 'suite' | 'king' | 'twin' | 'penthouse';
};

type AvailabilityResult = {
  available: boolean;
  blockedDates: string[]; // ISO date strings
};

type RoomsQuery = {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[]; // filter: must include all
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  perPage?: number;
};

/* ============================
   Mock fallback data (used if backend unavailable)
   Replace with your backend data production arrays
   ============================ */
const MOCK_ROOMS: Room[] = [
  {
    id: 'r-sig-01',
    name: 'Signature Suite',
    slug: 'signature-suite',
    price: 69000,
    images: ['/Bedroom 1.jpg', '/placeholder.jpg'],
    shortDesc: 'Two-bedroom sanctuary with private lounge and butler service.',
    longDesc: 'Large suite with separate living area, private lounge, and signature services. Perfect for long stays and special occasions.',
    guests: 4,
    bedrooms: 2,
    amenities: ['wifi', 'breakfast', 'ac', 'minibar', 'bathtub'],
    rating: 4.9,
    badge: 'Most Booked',
    type: 'suite',
  },
  {
    id: 'r-king-01',
    name: 'Executive King',
    slug: 'executive-king',
    price: 34000,
    images: ['/placeholder.jpg'],
    shortDesc: 'Work-ready room, king bed, rainfall shower.',
    longDesc: 'Comfortable room designed for business travelers who appreciate space to work and rest.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'work-desk', 'ac'],
    rating: 4.6,
    badge: undefined,
    type: 'king',
  },
  {
    id: 'r-deluxe-01',
    name: 'Deluxe Twin',
    slug: 'deluxe-twin',
    price: 28000,
    images: ['/placeholder.jpg'],
    shortDesc: 'Flexible twin room with modern layout.',
    longDesc: 'Two comfortable beds, bright layout with lounge seating and all modern amenities.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'ac'],
    rating: 4.4,
    badge: 'Popular',
    type: 'twin',
  },
  // ... add more rooms as needed
];

/* ============================
   API helpers
   - Replace the endpoint URLs below with your real backend.
   - The functions include fallback to MOCK_ROOMS for offline/dev.
   ============================ */

async function fetchRoomsApi(query: RoomsQuery): Promise<{ rooms: Room[]; total: number; page: number; perPage: number; }> {
  // Build query params
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (typeof query.minPrice !== 'undefined') params.set('minPrice', String(query.minPrice));
  if (typeof query.maxPrice !== 'undefined') params.set('maxPrice', String(query.maxPrice));
  if (query.amenities && query.amenities.length) params.set('amenities', query.amenities.join(','));
  if (query.sort) params.set('sort', query.sort);
  params.set('page', String(query.page ?? 1));
  params.set('perPage', String(query.perPage ?? 12));

  const url = `/api/rooms?${params.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Rooms API error');
    const data = await res.json();
    return {
      rooms: data.rooms as Room[],
      total: data.total ?? data.rooms.length,
      page: data.page ?? 1,
      perPage: data.perPage ?? 12
    };
  } catch (err) {
    // fallback for dev: filter mock data client-side
    console.warn('fetchRoomsApi failed, using mock data', err);
    let list = MOCK_ROOMS.slice();
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter(r => (r.name + ' ' + (r.shortDesc ?? '') + ' ' + (r.longDesc ?? '')).toLowerCase().includes(q));
    }
    if (query.minPrice) list = list.filter(r => r.price >= (query.minPrice ?? 0));
    if (query.maxPrice) list = list.filter(r => r.price <= (query.maxPrice ?? 99999999));
    if (query.amenities && query.amenities.length) list = list.filter(r => query.amenities!.every(a => r.amenities.includes(a)));
    // simplistic sort
    if (query.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (query.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (query.sort === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const perPage = query.perPage ?? 12;
    const page = query.page ?? 1;
    const start = (page - 1) * perPage;
    return { rooms: list.slice(start, start + perPage), total: list.length, page, perPage };
  }
}

async function checkAvailabilityApi(roomId: string, startDate: string, endDate: string, signal?: AbortSignal): Promise<AvailabilityResult> {
  const url = '/api/availability';
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ roomId, startDate, endDate }),
      headers: { 'Content-Type': 'application/json' },
      signal
    });
    if (!res.ok) throw new Error('availability check failed');
    const data = await res.json();
    return { available: data.available, blockedDates: data.blockedDates || [] };
  } catch (err) {
    // fallback (optimistic) — for dev assume available except some mock blocked dates
    console.warn('checkAvailabilityApi failed — using optimistic fallback', err);
    const mockBlocked: string[] = [];
    return { available: true, blockedDates: mockBlocked };
  }
}

async function postBookingApi(payload: { roomId: string; startDate: string; endDate: string; guests: number; name: string; email: string; }): Promise<{ ok: boolean; bookingId?: string; message?: string; }> {
  const url = '/api/book';
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Booking failed');
    }
    const data = await res.json();
    return { ok: true, bookingId: data.bookingId };
  } catch (err) {
    console.warn('postBookingApi failed', err);
    return { ok: false, message: (err as Error).message || 'Booking failed' };
  }
}

/* ============================
   Small UI components
   ============================ */

const IconCheck: React.FC = () => <span style={{ color: TOKENS.gold, fontWeight: 800 }}>✓</span>;

function SkeletonCard() {
  return (
    <div style={{ width: '100%', maxWidth: 420, borderRadius: 12, background: 'rgba(255,255,255,0.02)', padding: 12 }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg,#111,#0d0d0f)', borderRadius: 10 }} />
      <div style={{ height: 14, background: '#0d0d0f', marginTop: 12, width: '60%', borderRadius: 6 }} />
      <div style={{ height: 12, background: '#0d0d0f', marginTop: 8, width: '40%', borderRadius: 6 }} />
    </div>
  );
}

/* DateRangePicker simple wrapper using native inputs */
const DateRangePicker: React.FC<{ start: string; end: string; onChange: (s: string, e: string) => void }> = ({ start, end, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
        Check-in
        <input type="date" value={start} onChange={e => onChange(e.target.value, end)} style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
        Check-out
        <input type="date" value={end} onChange={e => onChange(start, e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
      </label>
    </div>
  );
};

/* Amenity pill */
const AmenityPill: React.FC<{ name: string }> = ({ name }) => (
  <span style={{ padding: '6px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', fontSize: 12 }}>{name}</span>
);

/* ============================
   RoomCard (compact) for results grid
   ============================ */
const RoomCard: React.FC<{ room: Room; onView: (r: Room) => void; onBookNow: (r: Room) => void }> = ({ room, onView, onBookNow }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ width: '100%', maxWidth: 420, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)', boxShadow: hover ? '0 20px 60px rgba(0,0,0,0.6)' : '0 8px 28px rgba(0,0,0,0.3)', transition: `transform 260ms ${TOKENS.ease}`, transform: hover ? 'translateY(-8px)' : 'translateY(0)' }}>
      <div style={{ position: 'relative', height: 220 }}>
        <img src={encodePath(room.images?.[0])} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {room.badge && <div style={{ position: 'absolute', top: 12, left: 12, background: TOKENS.crimson, color: '#fff', padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}>{room.badge}</div>}
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{ fontFamily: 'serif', margin: 0 }}>{room.name}</h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: TOKENS.gold }}>{formatKsh(room.price)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>per night</div>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>{room.shortDesc}</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {room.amenities.slice(0, 4).map(a => <AmenityPill key={a} name={a} />)}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => onView(room)} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>View</button>
          <button onClick={() => onBookNow(room)} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: TOKENS.crimson, color: '#fff', border: 'none' }}>Book</button>
        </div>
      </div>
    </div>
  );
};

/* ============================
   RoomDetailDrawer (modal/drawer) with availability check + booking form
   ============================ */
const RoomDetail: React.FC<{ room: Room | null; open: boolean; onClose: () => void }> = ({ room, open, onClose }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [guests, setGuests] = useState<number>(Math.max(1, room?.guests ?? 1));
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  useEffect(() => {
    if (!open) {
      setStartDate('');
      setEndDate('');
      setAvailability(null);
      setBooking({ loading: false });
    } else if (room) {
      setGuests(Math.max(1, room.guests ?? 1));
    }
  }, [open, room]);

  const abortRef = useRef<AbortController | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!room) return;
    if (!startDate || !endDate) {
      setAvailability(null);
      return;
    }
    setChecking(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await checkAvailabilityApi(room.id, startDate, endDate, ac.signal);
      setAvailability(res);
    } catch (err) {
      console.error(err);
      setAvailability({ available: true, blockedDates: [] });
    } finally {
      setChecking(false);
    }
  }, [room, startDate, endDate]);

  useEffect(() => {
    // Debounce check
    const t = setTimeout(() => { if (startDate && endDate) checkAvailability(); }, 420);
    return () => { clearTimeout(t); abortRef.current?.abort(); };
  }, [startDate, endDate, checkAvailability]);

  const submitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    if (!name || !email || !startDate || !endDate) {
      setBooking({ loading: false, success: false, message: 'Please fill required fields and dates.' });
      return;
    }
    setBooking({ loading: true });
    const payload = { roomId: room.id, startDate, endDate, guests, name, email };
    const res = await postBookingApi(payload);
    if (res.ok) {
      setBooking({ loading: false, success: true, message: `Booked! Ref ${res.bookingId}` });
    } else {
      setBooking({ loading: false, success: false, message: res.message || 'Booking failed' });
    }
  };

  if (!open || !room) return null;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ width: 'min(1100px, 96vw)', borderRadius: 12, overflow: 'hidden', background: '#0b0a0d', boxShadow: '0 40px 120px rgba(0,0,0,0.85)', display: 'flex', gap: 0 }}>
        <div style={{ width: '55%', minHeight: 420, background: '#000' }}>
          {/* Simple gallery: show first image */}
          <img src={encodePath(room.images[0])} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ width: '45%', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontFamily: 'serif', margin: 0 }}>{room.name}</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: TOKENS.gold }}>{formatKsh(room.price)}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>per night</div>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.86)' }}>{room.longDesc || room.shortDesc}</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {room.amenities.map(a => <AmenityPill key={a} name={a} />)}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 4, marginBottom: 4 }} />

          <form onSubmit={submitBooking}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                Name
                <input name="name" type="text" required style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                Email
                <input name="email" type="email" required style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <DateRangePicker start={startDate} end={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                Guests
                <input type="number" value={guests} min={1} onChange={e => setGuests(Math.max(1, Number(e.target.value || 1)))} style={{ width: 72, padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
              </label>
              <div style={{ marginLeft: 'auto' }}>
                <button type="submit" disabled={booking.loading || checking} style={{ padding: '10px 14px', borderRadius: 10, background: TOKENS.crimson, color: '#fff', border: 'none', fontWeight: 700 }}>
                  {booking.loading ? 'Booking…' : 'Book now'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {checking ? <div style={{ color: '#ddd' }}>Checking availability…</div> : availability ? (
                availability.available ? <div style={{ color: TOKENS.gold }}>Available for selected dates</div> : <div style={{ color: '#f66' }}>Not available for selected dates</div>
              ) : <div style={{ color: 'rgba(255,255,255,0.6)' }}>Enter dates to check availability</div>}
            </div>

            <div style={{ marginTop: 8 }}>
              {booking.success ? <div style={{ color: TOKENS.gold, fontWeight: 700 }}>{booking.message}</div> : booking.message ? <div style={{ color: '#f66' }}>{booking.message}</div> : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============================
   Main RoomsPage component
   - Search + Filters sidebar + Results grid
   ============================ */
export default function RoomsPage() {
  const [query, setQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: true, breakfast: false, ac: true, 'work-desk': false, bathtub: false
  });
  const [sort, setSort] = useState<RoomsQuery['sort']>('price_asc');
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(6);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const availableAmenityKeys = useMemo(() => Object.keys(amenities), [amenities]);
  const router = useRouter();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q: RoomsQuery = {
        q: query || undefined,
        minPrice: minPrice,
        maxPrice: maxPrice,
        amenities: availableAmenityKeys.filter(k => amenities[k]),
        sort,
        page,
        perPage
      };
      const res = await fetchRoomsApi(q);
      setRooms(res.rooms);
      setTotal(res.total);
    } catch (err) {
      setError('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  }, [query, minPrice, maxPrice, amenities, sort, page, perPage, availableAmenityKeys]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const toggleAmenity = (key: string) => setAmenities(prev => ({ ...prev, [key]: !prev[key] }));

  const onView = (r: Room) => { setSelectedRoom(r); setDetailOpen(true); };
  const onBookNow = (r: Room) => { setSelectedRoom(r); setDetailOpen(true); /* optionally prefill dates */ };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const goto = useCallback((path: string) => {
    if (!path) return;
    router.push(path);
  }, [router]);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100vh', padding: '24px 12px' }}>
      <style>{`
        .rooms-container { max-width: 1360px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 980px) { .rooms-container { grid-template-columns: 1fr; } }
      `}</style>

      <header style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'serif', margin: 0 }}>Rooms & Suites</h1>
          <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Find the perfect room for your stay — filter by dates, price, and amenities.</div>
        </div>
        <div>
          <button onClick={() => goto('/bookings')} style={{ padding: '8px 12px', background: TOKENS.crimson, color: '#fff', borderRadius: 8, border: 'none' }}>My Bookings</button>
        </div>
      </header>

      <div className="rooms-container">
        {/* Filters / Sidebar */}
        <aside style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Search</div>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., signature suite" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
            </label>

            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Min price</div>
                  <input type="number" value={minPrice ?? ''} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
                </div>
                <div style={{ width: 12 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Max price</div>
                  <input type="number" value={maxPrice ?? ''} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Dates</div>
              <DateRangePicker start={''} end={''} onChange={() => { /* main filter could store global dates for availability checks */ }} />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Amenities</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {Object.keys(amenities).map(key => (
                  <label key={key} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={amenities[key]} onChange={() => toggleAmenityLocal(setAmenities, key)} />
                    <span style={{ fontSize: 13 }}>{key}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Sort</div>
              <select value={sort} onChange={e => setSort(e.target.value as any)} style={{ width: '100%', padding: 8, borderRadius: 8, marginTop: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#fff' }}>
                <option value="price_asc">Price — Low to High</option>
                <option value="price_desc">Price — High to Low</option>
                <option value="rating">Rating</option>
                <option value="popular">Popularity</option>
              </select>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => { setPage(1); fetchNow(); }} style={{ padding: '10px 12px', borderRadius: 8, background: TOKENS.crimson, color: '#fff', border: 'none' }}>Apply</button>
              <button onClick={() => { resetFilters(setQuery, setMinPrice, setMaxPrice, setAmenities, setSort); }} style={{ padding: '10px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}>Reset</button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.84)' }}>{loading ? 'Loading rooms…' : `${total} rooms found`}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Page</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: '6px 8px', borderRadius: 8 }}>‹</button>
                <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>{page}</div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '6px 8px', borderRadius: 8 }}>›</button>
              </div>
            </div>
          </div>

          {error && <div style={{ color: 'salmon', marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {loading ? Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />) : rooms.map(r => <RoomCard key={r.id} room={r} onView={onView} onBookNow={onBookNow} />)}
          </div>

          {/* Pagination footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: 8 }}>First</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: 8 }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 12px', borderRadius: 8 }}>Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ padding: '8px 12px', borderRadius: 8 }}>Last</button>
            </div>
          </div>
        </section>
      </div>

      {/* detail modal */}
      <RoomDetail room={selectedRoom} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );

  /* local helpers inside component so they capture state up-to-date */
  function fetchNow() { setPage(1); /* triggers effect to fetchRooms */ }

  function toggleAmenityLocal(setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string) {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function resetFilters(setQueryFn: React.Dispatch<React.SetStateAction<string>>, setMin: React.Dispatch<React.SetStateAction<number|undefined>>, setMax: React.Dispatch<React.SetStateAction<number|undefined>>, setAmen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, setSortFn: React.Dispatch<React.SetStateAction<RoomsQuery['sort']>>) {
    setQueryFn('');
    setMin(undefined);
    setMax(undefined);
    setAmen({ wifi: true, breakfast: false, ac: true, 'work-desk': false, bathtub: false });
    setSortFn('price_asc');
  }
}

/* ============================
   End of file
   ============================ */
