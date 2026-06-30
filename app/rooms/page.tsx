'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Single-file Rooms + Booking (client) — avoids hydration mismatch
 *
 * Usage:
 * - Place at app/rooms/page.tsx in a Next.js app
 * - Add images to /public/images/ matching the ROOM_DATA image paths below
 *
 * Notes on hydration:
 * - We don't access localStorage or window during initial render.
 * - Any client-only data is hydrated in useEffect so server/client initial render is deterministic.
 *
 * Payment demo:
 * - MPESA mock: enter password "1234" in checkout -> success (demo).
 */

/* ============================
   Types
   ============================ */
type Room = {
  id: string;
  name: string;
  price: number;
  images: string[];
  shortDesc?: string;
  longDesc?: string;
  guests: number;
  bedrooms?: number;
  amenities: string[]; // like 'wifi'
  rating?: number;
  badge?: string;
  type?: string;
  location?: string;
  petsAllowed?: boolean;
};

type CartItem = {
  id: string; // cart item id (generated in event handlers)
  roomId: string;
  name: string;
  price: number;
  qty: number;
  nights: number;
  checkIn?: string;
  checkOut?: string;
  meta?: Record<string, any>;
};

/* ============================
   Design tokens & helpers
   ============================ */
const TOKENS = {
  bg: '#ffffff',
  text: '#0b1220',
  accent: '#0b84ff',
  gold: '#E5C494',
  crimson: '#b71c1c',
  ease: 'cubic-bezier(.16,1,.3,1)'
};

function formatKsh(amount: number) {
  return `Ksh ${amount.toLocaleString('en-KE')}`;
}

function makeId(prefix = '') {
  // small id generator using timestamp + counter to avoid randomness in render
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ============================
   Static seeded rooms (15 rooms)
   - Update image paths in /public/images if needed
   ============================ */
const ROOM_DATA: Room[] = [
  {
    id: 'r001',
    name: 'Signature Grand Suite',
    price: 95000,
    images: ['/Hotel Suite.jpeg', '/Twin Room.jpeg'],
    shortDesc: 'Two-bedroom suite with private lounge, butler service & rooftop views.',
    longDesc: 'Expansive suite on the top floor with private lounge, butler, dining area and panoramic windows. Ideal for celebrations and long stays.',
    guests: 5,
    bedrooms: 2,
    amenities: ['wifi', 'breakfast', 'spa', 'bathtub', 'minibar', 'tv', 'personal-service'],
    rating: 4.98,
    badge: 'Most Luxurious',
    type: 'suite',
    location: 'Rooftop Wing',
    petsAllowed: false
  },
  {
    id: 'r002',
    name: 'Executive King',
    price: 42000,
    images: ['/King Hotel room.jpeg'],
    shortDesc: 'King bed, desk and high-speed Wi-Fi — business-ready.',
    longDesc: 'Spacious room with large desk, ergonomic chair, fast Wi-Fi and premium coffee station. Ideal for business travellers.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'work-desk', 'ac', 'tv', 'phone-service'],
    rating: 4.6,
    badge: 'Business Pick',
    type: 'king',
    location: 'Business Tower - Floor 6',
    petsAllowed: false
  },
  {
    id: 'r003',
    name: 'Deluxe Twin',
    price: 28000,
    images: ['/Bedroom.jpg'],
    shortDesc: 'Flexible twin room with modern layout and garden views.',
    longDesc: 'Two comfortable beds, bright layout with lounge seating and modern amenities.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'ac', 'tv'],
    rating: 4.4,
    badge: 'Popular',
    type: 'twin',
    location: 'Garden Wing - Floor 2',
    petsAllowed: true
  },
  {
    id: 'r004',
    name: 'Penthouse Ocean View',
    price: 150000,
    images: ['/Bedroom 1.jpg', '/Bedroom 2.jpg'],
    shortDesc: 'Private penthouse with terrace, jacuzzi and ocean views.',
    longDesc: 'A showstopper penthouse with terrace, jacuzzi, large dining room and private elevator. Includes chef-on-call option.',
    guests: 6,
    bedrooms: 3,
    amenities: ['wifi', 'personal-service', 'bathtub', 'spa', 'minibar', 'swimming'],
    rating: 5.0,
    badge: 'Top Rated',
    type: 'penthouse',
    location: 'Oceanfront Tower - Top Floor',
    petsAllowed: false
  },
  {
    id: 'r005',
    name: 'Family Suite',
    price: 62000,
    images: ['/Hotel.jpg'],
    shortDesc: 'Two bedrooms joined by family lounge, kids play access.',
    longDesc: 'Perfect for families: two bedrooms, child-friendly amenities, inter-connecting doors and access to kids club.',
    guests: 5,
    bedrooms: 2,
    amenities: ['wifi', 'breakfast', 'games-room', 'tv', 'minibar'],
    rating: 4.75,
    badge: 'Family Favorite',
    type: 'suite',
    location: 'Family Wing - Floor 3',
    petsAllowed: true
  },
  {
    id: 'r006',
    name: 'Budget Single',
    price: 12000,
    images: ['/images/budget-single.jpg'],
    shortDesc: 'Compact room with comfortable bed and essential amenities.',
    longDesc: 'No-frills room for solo travelers who want a clean, comfortable stay without extras.',
    guests: 1,
    bedrooms: 1,
    amenities: ['wifi', 'ac'],
    rating: 4.0,
    type: 'single',
    location: 'Economy Wing - Floor B1',
    petsAllowed: false
  },
  {
    id: 'r007',
    name: 'Spa Retreat',
    price: 78000,
    images: ['/images/spa-retreat.jpg'],
    shortDesc: 'Includes spa treatments, sauna access, and private relaxation lounge.',
    longDesc: 'A restorative retreat that includes spa vouchers, private sauna booking and healthy breakfast options.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'spa', 'sauna', 'breakfast', 'bathtub'],
    rating: 4.9,
    badge: 'Wellness',
    type: 'suite',
    location: 'Wellness Wing - Floor 1',
    petsAllowed: false
  },
  {
    id: 'r008',
    name: 'Poolside Deluxe',
    price: 46000,
    images: ['/images/poolside.jpg'],
    shortDesc: 'Direct access to the pool and pool terrace seating.',
    longDesc: 'Rooms that open directly onto the pool area. Pool towel service included.',
    guests: 3,
    bedrooms: 1,
    amenities: ['wifi', 'swimming', 'tv', 'minibar'],
    rating: 4.5,
    badge: 'Pool Access',
    type: 'deluxe',
    location: 'Pool Wing - Floor G',
    petsAllowed: true
  },
  {
    id: 'r009',
    name: 'Romance Corner',
    price: 55000,
    images: ['/images/romance.jpg'],
    shortDesc: 'Perfect for couples: breakfast-in-bed and private dining.',
    longDesc: 'Romantic setup with champagne on arrival, breakfast in bed, and private dining experiences available.',
    guests: 2,
    bedrooms: 1,
    amenities: ['breakfast-in-bed', 'personal-service', 'bathtub', 'minibar'],
    rating: 4.85,
    badge: 'Couples',
    type: 'king',
    location: 'Corner Wing - Floor 7',
    petsAllowed: false
  },
  {
    id: 'r010',
    name: 'Studio Loft',
    price: 34000,
    images: ['/images/studio-loft.jpg'],
    shortDesc: 'Open-plan studio with kitchenette and city views.',
    longDesc: 'Stylish open-plan loft with compact kitchenette, ideal for longer stays and self-catering.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'minibar', 'tv'],
    rating: 4.45,
    type: 'studio',
    location: 'City Wing - Floor 4',
    petsAllowed: false
  },
  {
    id: 'r011',
    name: 'Accessible Room',
    price: 27000,
    images: ['/images/accessible.jpg'],
    shortDesc: 'Accessible layout with roll-in shower and widened doors.',
    longDesc: 'Comfortable accessible room with roll-in shower, grab bars, and extra space for mobility devices.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'ac', 'tv'],
    rating: 4.3,
    type: 'accessible',
    location: 'Lower Wing - Floor 1',
    petsAllowed: false
  },
  {
    id: 'r012',
    name: 'Garden Cottage',
    price: 38000,
    images: ['/images/garden-cottage.jpg'],
    shortDesc: 'Private cottage near the gardens with patio seating.',
    longDesc: 'Standalone cottage with private garden patio and outdoor seating. Great for nature lovers.',
    guests: 3,
    bedrooms: 2,
    amenities: ['wifi', 'breakfast', 'tv', 'minibar'],
    rating: 4.55,
    type: 'cottage',
    location: 'Garden Estate',
    petsAllowed: true
  },
  {
    id: 'r013',
    name: 'Loft Family',
    price: 69000,
    images: ['/images/loft-family.jpg'],
    shortDesc: 'Two-level loft with dedicated family lounge and bunks for kids.',
    longDesc: 'Two-level family loft with lounge, bunk area and family-friendly amenities.',
    guests: 6,
    bedrooms: 3,
    amenities: ['wifi', 'games-room', 'tv', 'minibar'],
    rating: 4.7,
    badge: 'Family',
    type: 'loft',
    location: 'Family Wing',
    petsAllowed: true
  },
  {
    id: 'r014',
    name: 'Rooftop Cabin',
    price: 83000,
    images: ['/images/rooftop-cabin.jpg'],
    shortDesc: 'Cozy cabin with private rooftop firepit and skyline views.',
    longDesc: 'Unique cabin experience on the rooftop with private firepit and skyline views.',
    guests: 4,
    bedrooms: 2,
    amenities: ['wifi', 'personal-service', 'minibar'],
    rating: 4.8,
    badge: 'Unique',
    type: 'cabin',
    location: 'Rooftop',
    petsAllowed: false
  },
  {
    id: 'r015',
    name: 'Economy Twin',
    price: 18000,
    images: ['/images/economy-twin.jpg'],
    shortDesc: 'Simple twin room for budget travelers with essentials included.',
    longDesc: 'Affordable twin with comfortable beds and essential amenities for modest stays.',
    guests: 2,
    bedrooms: 1,
    amenities: ['wifi', 'ac'],
    rating: 4.05,
    type: 'twin',
    location: 'Economy Wing',
    petsAllowed: false
  }
];

/* ============================
   Mock services (client-side, run only after mount)
   - filterRooms: local filter/sort/pagination
   - checkAvailability: fake availability
   - mockMpesaPayment: demo (password "1234" => success)
   ============================ */

async function filterRoomsClient(options: {
  q?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  pets?: boolean | undefined;
  amenities?: string[] | undefined;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  perPage?: number;
}) {
  // simulate API latency (client-side only)
  await new Promise((r) => setTimeout(r, 160 + Math.random() * 200));

  let list = ROOM_DATA.slice();

  if (options.q) {
    const q = options.q.toLowerCase();
    list = list.filter(
      (r) =>
        (r.name + ' ' + (r.shortDesc || '') + ' ' + (r.longDesc || '') + ' ' + (r.location || '')).toLowerCase().includes(q)
    );
  }
  if (options.location) {
    const q = options.location.toLowerCase();
    list = list.filter((r) => (r.location || '').toLowerCase().includes(q));
  }
  if (typeof options.minPrice !== 'undefined') list = list.filter((r) => r.price >= options.minPrice!);
  if (typeof options.maxPrice !== 'undefined') list = list.filter((r) => r.price <= options.maxPrice!);
  if (typeof options.guests !== 'undefined') list = list.filter((r) => r.guests >= options.guests!);
  if (typeof options.bedrooms !== 'undefined') list = list.filter((r) => (r.bedrooms ?? 0) >= options.bedrooms!);
  if (typeof options.pets !== 'undefined') list = list.filter((r) => r.petsAllowed === options.pets);
  if (options.amenities && options.amenities.length) {
    list = list.filter((r) => options.amenities!.every((a) => r.amenities.includes(a)));
  }

  if (options.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  if (options.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  if (options.sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (options.sort === 'popular') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const page = options.page ?? 1;
  const perPage = options.perPage ?? 8;
  const total = list.length;
  const start = (page - 1) * perPage;
  const items = list.slice(start, start + perPage);
  return { rooms: items, total, page, perPage };
}

async function checkAvailabilityClient(roomId: string, start: string, end: string) {
  // runs only on client after mount
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 200));
  // For demo: if the chosen room is id ending in 3 or 8 we sometimes say unavailable randomly (but only after mount)
  const maybeBlocked = (roomId.endsWith('3') || roomId.endsWith('8')) && Math.random() < 0.28;
  if (maybeBlocked) {
    return { available: false, blockedDates: [new Date().toISOString().slice(0, 10)] };
  }
  return { available: true, blockedDates: [] };
}

async function mockMpesaPaymentClient(opts: { amount: number; phone?: string; name?: string; password?: string }) {
  // simulate network
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
  if (opts.password === '1234') {
    return { ok: true, tx: `MPESA-${Date.now().toString(36)}` };
  } else {
    return { ok: false, message: 'Invalid demo MPESA password' };
  }
}

/* ============================
   Local storage helpers (NO localStorage access during render)
   - load/save functions will be called inside useEffect
   ============================ */
const STORAGE_KEY = 'demo_rooms_cart_v2';

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

/* ============================
   Main single-file client component
   ============================ */
export default function RoomsBookingPage() {
  /* ------------------
     Filter state
     ------------------ */
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [guests, setGuests] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [petsAllowed, setPetsAllowed] = useState<'any' | 'only-yes' | 'only-no'>('any');
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'rating' | 'popular'>('price_asc');
  const [page, setPage] = useState(1);
  const perPage = 8;

  // amenities list derived from seed (stable)
  const ALL_AMENITIES = useMemo(() => {
    const s = new Set<string>();
    ROOM_DATA.forEach((r) => r.amenities.forEach((a) => s.add(a)));
    return Array.from(s).sort();
  }, []);

  const [amenities, setAmenities] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    ALL_AMENITIES.forEach((a) => (obj[a] = false));
    obj['wifi'] = true;
    obj['tv'] = true;
    return obj;
  });

  /* ------------------
     Results state (deterministic initial render)
     ------------------ */
  const [rooms, setRooms] = useState<Room[]>([]); // initially empty list (deterministic)
  const [totalRooms, setTotalRooms] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* ------------------
     Selection & UI state
     ------------------ */
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [globalCheckIn, setGlobalCheckIn] = useState(''); // date strings
  const [globalCheckOut, setGlobalCheckOut] = useState('');

  /* ------------------
     Cart state (initially deterministic: empty on both server and client render)
     - We populate from localStorage in useEffect after mount
     ------------------ */
  const [cart, setCart] = useState<CartItem[]>([]); // initial empty -> deterministic
  const [cartOpen, setCartOpen] = useState(false);

  /* ------------------
     Checkout modal state
     ------------------ */
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /* ------------------
     Effects: hydrate cart & initial rooms after mount
     ------------------ */
  useEffect(() => {
    // hydrate cart from localStorage after mount (client-only)
    try {
      const saved = loadCart();
      if (Array.isArray(saved) && saved.length) setCart(saved);
    } catch {}
  }, []);

  useEffect(() => {
    // save on cart changes (client-only)
    try {
      saveCart(cart);
    } catch {}
  }, [cart]);

  // fetch rooms whenever filters change — run client-side after mount (no SSR-determinism issues)
  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    setErr(null);
    try {
      const reqAmenities = Object.keys(amenities).filter((k) => amenities[k]);
      const res = await filterRoomsClient({
        q: query || undefined,
        location: locationFilter || undefined,
        minPrice: typeof minPrice === 'number' ? minPrice : undefined,
        maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
        guests: typeof guests === 'number' ? guests : undefined,
        bedrooms: typeof bedrooms === 'number' ? bedrooms : undefined,
        pets: petsAllowed === 'only-yes' ? true : petsAllowed === 'only-no' ? false : undefined,
        amenities: reqAmenities.length ? reqAmenities : undefined,
        sort,
        page,
        perPage
      });
      setRooms(res.rooms);
      setTotalRooms(res.total);
    } catch (e: any) {
      setErr('Could not load rooms');
    } finally {
      setLoadingRooms(false);
    }
  }, [query, locationFilter, minPrice, maxPrice, guests, bedrooms, petsAllowed, amenities, sort, page]);

  useEffect(() => {
    // always run fetchRooms only after mount — this is inside client component so fine
    fetchRooms();
  }, [fetchRooms]);

  /* ------------------
     Cart operations (added only via event handlers)
     ------------------ */
  const addToCart = (room: Room, nights = 1, checkIn?: string, checkOut?: string) => {
    setCart((prev) => {
      // try to find identical item (same room + same dates)
      const found = prev.find((p) => p.roomId === room.id && p.checkIn === checkIn && p.checkOut === checkOut);
      if (found) {
        return prev.map((p) => (p === found ? { ...p, qty: p.qty + 1 } : p));
      } else {
        const item: CartItem = {
          id: makeId('c_'),
          roomId: room.id,
          name: room.name,
          price: room.price,
          qty: 1,
          nights: Math.max(1, nights),
          checkIn,
          checkOut,
          meta: { type: room.type, location: room.location }
        };
        return [...prev, item];
      }
    });
    setCartOpen(true);
  };

  const removeCartItem = (id: string) => setCart((p) => p.filter((it) => it.id !== id));
  const updateCartQty = (id: string, qty: number) => setCart((p) => p.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));
  const clearCart = () => setCart([]);

  const cartSubtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty * (it.nights || 1), 0), [cart]);

  /* ------------------
     UI small helpers
     ------------------ */
  function AmenityIcon({ name }: { name: string }) {
    const common = { width: 16, height: 16, style: { verticalAlign: 'middle', marginRight: 6 } as React.CSSProperties };
    // inline minimal svgs
    switch (name) {
      case 'wifi':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M12 18c.8 0 1.6-.3 2.3-.9l-2.3-2.1-2.3 2.1c.7.6 1.5.9 2.3.9zM3 8a14 14 0 0118 0l-2 2a11 11 0 00-14 0L3 8zm8 6c1.1 0 2-.9 2-2H9c0 1.1.9 2 2 2z" /></svg>;
      case 'breakfast':
      case 'breakfast-in-bed':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M8 6h8v2H8zM4 10h16v2H4zM6 14h12v2H6z" /></svg>;
      case 'spa':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M12 2s4 3 4 8-4 6-4 12c0-6-4-7-4-12S12 2 12 2z" /></svg>;
      case 'bathtub':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M18 12V7a4 4 0 10-8 0v5H6v6h12v-6h-0zM8 7a2 2 0 114 0v1H8V7z" /></svg>;
      case 'tv':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M2 6v10h20V6H2zm2 2h16v6H4V8zM10 20h4v-2h-4v2z" /></svg>;
      case 'work-desk':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M4 10h16v6H4zM2 18h2v2H2zM20 18h2v2h-2z" /></svg>;
      case 'personal-service':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a4 4 0 110 8 4 4 0 010-8zm-6 14c0-3.3 4-5 6-5s6 1.7 6 5v3H6v-3z" /></svg>;
      case 'swimming':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M2 18h20v2H2zM4 14c2-1 4-2 6-2s4 1 6 2 4-1 6-2v4H4v-4z" /></svg>;
      case 'games-room':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3z" /></svg>;
      case 'minibar':
        return <svg {...common} viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h16v18H4zM6 6v12h12V6H6z" /></svg>;
      default:
        return <svg {...common} viewBox="0 0 24 24"><circle cx="8" cy="8" r="6" fill="currentColor" /></svg>;
    }
  }

  /* ------------------
     Internal subcomponents (kept inline for single-file)
     ------------------ */

  function SkeletonCard() {
    return (
      <div className="card skeleton">
        <div className="s-img" />
        <div className="s-line short" />
        <div className="s-line" />
        <div className="s-line tiny" />
      </div>
    );
  }

  function RoomCard({ room }: { room: Room }) {
    const [hover, setHover] = useState(false);
    return (
      <article
        className={`card room-card ${hover ? 'hover' : ''}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="card-media">
          <img src={room.images?.[0] ?? '/images/placeholder.jpg'} alt={room.name} className="card-image" />
          {room.badge && <div className="badge">{room.badge}</div>}
        </div>
        <div className="card-body">
          <div className="card-head">
            <div>
              <h3 className="card-title">{room.name}</h3>
              <div className="muted" style={{ fontSize: 13 }}>{room.location} • {room.type}</div>
            </div>
            <div className="card-price">{formatKsh(room.price)}</div>
          </div>

          <p className="card-desc">{room.shortDesc}</p>

          <div className="amenities-row">
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="amenity-pill" title={a}>
                <AmenityIcon name={a} />
                <span style={{ textTransform: 'capitalize' }}>{a.replace('-', ' ')}</span>
              </span>
            ))}
          </div>

          <div className="card-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setSelectedRoom(room);
                setDetailOpen(true);
              }}
            >
              View
            </button>
            <button
              className="btn primary"
              onClick={() => addToCart(room, 1, globalCheckIn || undefined, globalCheckOut || undefined)}
            >
              Add to cart
            </button>
          </div>
        </div>
      </article>
    );
  }

  function RoomDetailDrawer({ room, isOpen, onClose }: { room: Room | null; isOpen: boolean; onClose: () => void }) {
    const [start, setStart] = useState(globalCheckIn);
    const [end, setEnd] = useState(globalCheckOut);
    const [avail, setAvail] = useState<{ available: boolean | null; blockedDates: string[] } | null>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
      if (!isOpen) {
        setStart(globalCheckIn);
        setEnd(globalCheckOut);
        setAvail(null);
        setChecking(false);
      } else {
        setStart(globalCheckIn);
        setEnd(globalCheckOut);
      }
    }, [isOpen, globalCheckIn, globalCheckOut]);

    useEffect(() => {
      let mounted = true;
      if (!room || !start || !end) {
        setAvail(null);
        return;
      }
      setChecking(true);
      checkAvailabilityClient(room.id, start, end)
        .then((r) => {
          if (!mounted) return;
          setAvail({ available: r.available, blockedDates: r.blockedDates });
        })
        .catch(() => {
          if (mounted) setAvail({ available: true, blockedDates: [] });
        })
        .finally(() => mounted && setChecking(false));
      return () => {
        mounted = false;
      };
    }, [room, start, end]);

    if (!isOpen || !room) return null;

    return (
      <div className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-backdrop" onClick={onClose} />
        <div className="drawer-panel">
          <div className="drawer-left">
            <img src={room.images?.[0] ?? '/images/placeholder.jpg'} alt={room.name} />
            <div className="thumb-row">
              {room.images.map((img, i) => (
                <img key={i} className="thumb" src={img} alt={`${room.name} ${i}`} />
              ))}
            </div>
          </div>
          <div className="drawer-right">
            <div className="drawer-top">
              <h2>{room.name}</h2>
              <div className="muted">{room.type} • {room.bedrooms ?? 1} br • up to {room.guests} guests • {room.location}</div>
              <div className="price-large">{formatKsh(room.price)}</div>
            </div>

            <p className="long-desc">{room.longDesc}</p>

            <div className="date-row">
              <label>
                <div className="label-small">Check-in</div>
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </label>
              <label>
                <div className="label-small">Check-out</div>
                <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: 8 }}>
              {checking ? <div className="muted">Checking availability…</div> : avail ? (avail.available ? <div className="success">Available</div> : <div className="error">Not available</div>) : <div className="muted">Enter dates to check availability</div>}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                className="btn primary"
                onClick={() => {
                  addToCart(room, 1, start || undefined, end || undefined);
                  onClose();
                }}
              >
                Book / Add to Cart
              </button>
              <button className="btn ghost" onClick={() => onClose()}>Close</button>
            </div>

            <div style={{ marginTop: 14 }}>
              <h4>Amenities</h4>
              <div className="amenities-grid">
                {room.amenities.map((a) => (
                  <div key={a} className="amenity-row">
                    <AmenityIcon name={a} />
                    <span style={{ textTransform: 'capitalize' }}>{a.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  function CartDrawer() {
    return (
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Cart</h3>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => setCartOpen(false)}>Close</button>
          </div>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? <div className="muted">Cart is empty</div> : cart.map((it) => (
            <div key={it.id} className="cart-item">
              <div>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div className="muted">Ksh {it.price.toLocaleString('en-KE')} × {it.qty} × {it.nights} night(s)</div>
                {it.checkIn && it.checkOut && <div className="muted">Dates: {it.checkIn} → {it.checkOut}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" className="input input-sm" min={1} value={it.qty} onChange={(e) => updateCartQty(it.id, Math.max(1, Number(e.target.value || 1)))} />
                <button className="btn ghost" onClick={() => removeCartItem(it.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-sub">Subtotal <strong>{formatKsh(cartSubtotal)}</strong></div>
          <div>
            <button className="btn ghost" onClick={() => { clearCart(); setCartOpen(false); }}>Clear</button>
            <button className="btn primary" onClick={() => { setCheckoutOpen(true); }} disabled={cart.length === 0} style={{ marginLeft: 8 }}>Checkout</button>
          </div>
        </div>
      </div>
    );
  }

  function CheckoutModal({ onClose }: { onClose: () => void }) {
    const [method, setMethod] = useState<'mpesa' | 'mpesa-express' | 'card' | 'stripe'>('mpesa');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // demo mpesa password
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const doPay = useCallback(async () => {
      setLoading(true);
      setMessage(null);
      try {
        if (method === 'mpesa' || method === 'mpesa-express') {
          if (!phone) {
            setMessage('Enter phone number for MPESA');
            setLoading(false);
            return;
          }
          const res = await mockMpesaPaymentClient({ amount: cartSubtotal, phone, name, password });
          if (res.ok) {
            setMessage(`Mock payment successful — Tx ${res.tx}`);
            // clear cart after a short pause to give feedback
            setTimeout(() => {
              clearCart();
              setCheckoutOpen(false);
              setCartOpen(false);
            }, 1300);
          } else {
            setMessage(res.message || 'Payment failed in demo');
          }
        } else {
          setMessage('This demo only supports MPESA mock payments. Other methods show a placeholder message.');
        }
      } catch (err: any) {
        setMessage(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    }, [method, phone, name, password, cartSubtotal]);

    return (
      <div className="modal-root">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-panel">
          <div className="modal-header">
            <h3>Checkout — {formatKsh(cartSubtotal)}</h3>
            <button className="btn ghost" onClick={onClose}>Close</button>
          </div>

          <div className="modal-body">
            <label className="label-small">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

            <label className="label-small" style={{ marginTop: 8 }}>Phone (for MPESA)</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2547XXXXXXXX" />

            <div style={{ marginTop: 8 }}>
              <div className="label-small">Payment method</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className={`btn ${method === 'mpesa' ? 'primary' : 'ghost'}`} onClick={() => setMethod('mpesa')}>MPESA</button>
                <button className={`btn ${method === 'mpesa-express' ? 'primary' : 'ghost'}`} onClick={() => setMethod('mpesa-express')}>MPESA Express</button>
                <button className={`btn ${method === 'card' ? 'primary' : 'ghost'}`} onClick={() => setMethod('card')}>Card</button>
                <button className={`btn ${method === 'stripe' ? 'primary' : 'ghost'}`} onClick={() => setMethod('stripe')}>Stripe</button>
              </div>
            </div>

            {(method === 'mpesa' || method === 'mpesa-express') && (
              <div style={{ marginTop: 10 }}>
                <div className="muted">Demo MPESA: enter demo password "1234" to simulate a successful payment.</div>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Demo MPESA password" />
              </div>
            )}

            {message && <div className="message-box" style={{ marginTop: 12 }}>{message}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={doPay} disabled={loading}>{loading ? 'Processing…' : `Pay ${formatKsh(cartSubtotal)}`}</button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------
     Render page
     ------------------ */

  const totalPages = Math.max(1, Math.ceil(totalRooms / perPage));

  return (
    <div className="page-root">
      <style>{`
        :root {
          --bg: ${TOKENS.bg};
          --text: ${TOKENS.text};
          --accent: ${TOKENS.accent};
          --gold: ${TOKENS.gold};
          --crimson: ${TOKENS.crimson};
        }
        * { box-sizing: border-box; }
        body,html,#__next { background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        .page-root { min-height: 100vh; padding: 28px; }

        .topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; max-width:1400px; margin: 0 auto 18px; }
        .brand { display:flex; align-items:center; gap:12px; }
        .brand .logo { width:48px; height:48px; border-radius:8px; background: linear-gradient(135deg,var(--accent), #6ec6ff); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }
        .brand h1 { margin:0; font-size:20px; letter-spacing:-0.2px; }
        .brand p { margin:0; font-size:13px; color:#6b7280; }

        .actions { display:flex; gap:8px; align-items:center; }

        .layout { display:grid; grid-template-columns: 320px 1fr; gap:20px; max-width:1400px; margin:0 auto; align-items:start; }
        @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } .sidebar { position: static; } }

        .sidebar { position: sticky; top: 20px; align-self:start; }
        .card { background: linear-gradient(180deg,#fff,#fbfbff); border-radius:12px; box-shadow: 0 6px 20px rgba(14,18,28,0.06); padding:14px; border: 1px solid rgba(14,20,30,0.04); }
        .filter-card .input { width:100%; padding:10px; border-radius:8px; border:1px solid rgba(14,20,30,0.06); background:transparent; }

        label { display:block; margin-top:8px; font-size:13px; color:#374151; }
        .input { width:100%; padding:10px; border-radius:8px; border:1px solid rgba(14,20,30,0.06); background:transparent; }
        .input-sm { width:64px; padding:6px; }
        .label-small { font-size:12px; color:#6b7280; display:block; margin-bottom:6px; }

        .btn { padding:10px 12px; border-radius:9px; cursor:pointer; transition: all 220ms ${TOKENS.ease}; border: none; font-weight:600; }
        .btn.ghost { background: transparent; border: 1px solid rgba(14,20,30,0.06); color: var(--text); }
        .btn.primary { background: linear-gradient(90deg,var(--accent), #2ea0ff); color:white; box-shadow: 0 8px 30px rgba(14,20,40,0.06); }
        .btn.ghost:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(14,20,30,0.04); }
        .btn.primary:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 18px 50px rgba(14,20,40,0.12); }

        .results-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .rooms-grid { display:grid; gap:18px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
        .room-card { display:flex; flex-direction:column; border-radius:12px; overflow:hidden; transition: transform 260ms ${TOKENS.ease}, box-shadow 260ms ${TOKENS.ease}; background: linear-gradient(180deg,#fff,#fcfdff); }
        .room-card.hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(10,14,20,0.08); }
        .card-media { position:relative; height:180px; overflow:hidden; }
        .card-image { width:100%; height:100%; object-fit:cover; display:block; transition: transform 420ms ${TOKENS.ease}; }
        .room-card.hover .card-image { transform: scale(1.04); }
        .badge { position:absolute; top:12px; left:12px; background: linear-gradient(90deg,var(--crimson), #9e1a1a); color:#fff; padding:6px 10px; border-radius:8px; font-weight:700; font-size:12px; }

        .card-body { padding:12px; display:flex; flex-direction:column; gap:8px; }
        .card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .card-title { margin:0; font-size:16px; }
        .card-price { color:var(--accent); font-weight:800; }
        .card-desc { font-size:13px; color:#374151; margin:0; }

        .amenities-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
        .amenity-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 8px; border-radius:999px; background: rgba(14,20,30,0.03); font-size:13px; color:#374151; }

        .card-actions { display:flex; gap:8px; margin-top:8px; }

        .skeleton { min-height:240px; display:flex; flex-direction:column; gap:10px; }
        .s-img { height:140px; background: linear-gradient(90deg,#eee,#f9f9f9); border-radius:8px; }
        .s-line { height:14px; background:#f3f4f6; border-radius:6px; width:100%; }
        .s-line.short { width:60%; }
        .s-line.tiny { width:40%; height:10px; }

        .drawer { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1200; }
        .drawer-backdrop { position:absolute; inset:0; background:rgba(6,8,12,0.45); }
        .drawer-panel { position:relative; width:min(1100px,96vw); height:min(84vh,760px); background:#fff; border-radius:12px; overflow:hidden; display:flex; box-shadow:0 40px 120px rgba(6,8,12,0.28); }
        .drawer-left { width:52%; background:#000; display:flex; flex-direction:column; }
        .drawer-left img { width:100%; height:60%; object-fit:cover; }
        .thumb-row { display:flex; gap:6px; padding:8px; background:#fafafa; }
        .thumb { width:64px; height:64px; object-fit:cover; border-radius:8px; }

        .drawer-right { padding:18px; width:48%; overflow:auto; }
        .drawer-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .muted { color:#6b7280; font-size:13px; }
        .price-large { font-weight:900; color:var(--accent); font-size:20px; }

        .date-row { display:flex; gap:8px; margin-top:8px; }
        .label-small input[type="date"] { padding:8px; border-radius:8px; border:1px solid rgba(14,20,30,0.06); }

        .amenities-grid { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
        .amenity-row { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:8px; background: #fbfbff; border:1px solid rgba(14,20,30,0.02); }

        .cart-drawer { position:fixed; right:-420px; top:0; height:100vh; width:380px; background:#fff; box-shadow: -12px 0 40px rgba(6,8,12,0.12); transition:right 320ms ${TOKENS.ease}; z-index:1250; display:flex; flex-direction:column; }
        .cart-drawer.open { right:18px; }
        .cart-header { padding:16px; display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(14,20,30,0.04); }
        .cart-body { padding:12px; overflow:auto; flex:1; }
        .cart-item { display:flex; justify-content:space-between; gap:10px; padding:12px; border-radius:8px; background:#fff; border:1px solid rgba(14,20,30,0.03); margin-bottom:10px; }
        .cart-footer { padding:12px; border-top:1px solid rgba(14,20,30,0.04); display:flex; align-items:center; justify-content:space-between; }

        .cart-sub { font-size:15px; color:#111827; }

        .modal-root { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1400; }
        .modal-backdrop { position:absolute; inset:0; background:rgba(6,8,12,0.45); }
        .modal-panel { position:relative; width:min(720px,94vw); background:#fff; border-radius:12px; box-shadow:0 30px 80px rgba(6,8,12,0.2); padding:14px; z-index:1401; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; gap:8px; border-bottom:1px solid rgba(14,20,30,0.04); padding-bottom:8px; }
        .modal-body { padding:12px 0; }
        .modal-footer { display:flex; justify-content:flex-end; gap:8px; padding-top:8px; border-top:1px solid rgba(14,20,30,0.04); }

        .message-box { padding:10px; background:#fff3cd; border-radius:8px; border:1px solid #ffeeba; color:#927a00; }

        .success { color: #0b845b; font-weight:700; }
        .error { color: #b71c1c; font-weight:700; }

        @media (max-width: 680px) {
          .drawer-panel { flex-direction:column; height:80vh; width:94vw; }
          .drawer-left, .drawer-right { width:100%; }
          .cart-drawer { width:100vw; right:-100vw; }
          .cart-drawer.open { right:0; }
        }
      `}</style>

      {/* Header */}
      <div className="topbar">
        <div className="brand">
          <div className="logo">RM</div>
          <div>
            <h1>Rooms & Booking</h1>
            <p className="muted">Pick a room, choose amenities, and checkout with demo MPESA.</p>
          </div>
        </div>

        <div className="actions">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input" placeholder="Search rooms, features, location..." style={{ width: 360 }} value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn ghost" onClick={() => { setPage(1); fetchRooms(); }}>Search</button>
          </div>

          <button className="btn ghost" onClick={() => setCartOpen((s) => !s)}>
            Cart ({cart.length})
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="layout">
        <aside className="sidebar">
          <div className="card filter-card">
            <h3>Filters</h3>

            <label className="label-small">Location</label>
            <input className="input" placeholder="e.g., Oceanfront" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="label-small">Min price</label>
                <input className="input" type="number" value={minPrice === '' ? '' : minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label-small">Max price</label>
                <input className="input" type="number" value={maxPrice === '' ? '' : maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="label-small">Guests</label>
                <input className="input" type="number" min={1} value={guests === '' ? '' : guests} onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label-small">Bedrooms</label>
                <input className="input" type="number" min={0} value={bedrooms === '' ? '' : bedrooms} onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" name="pets" checked={petsAllowed === 'any'} onChange={() => setPetsAllowed('any')} /> Any
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" name="pets" checked={petsAllowed === 'only-yes'} onChange={() => setPetsAllowed('only-yes')} /> Pets OK
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" name="pets" checked={petsAllowed === 'only-no'} onChange={() => setPetsAllowed('only-no')} /> No pets
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="label-small">Amenities</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_AMENITIES.map((a) => (
                  <label key={a} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={Boolean(amenities[a])} onChange={() => setAmenities((prev) => ({ ...prev, [a]: !prev[a] }))} />
                    <span style={{ textTransform: 'capitalize' }}>{a.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="label-small">Dates</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" type="date" value={globalCheckIn} onChange={(e) => setGlobalCheckIn(e.target.value)} />
                <input className="input" type="date" value={globalCheckOut} onChange={(e) => setGlobalCheckOut(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="label-small">Sort</label>
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                <option value="price_asc">Price — low to high</option>
                <option value="price_desc">Price — high to low</option>
                <option value="rating">Rating</option>
                <option value="popular">Popularity</option>
              </select>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={() => { setPage(1); fetchRooms(); }}>Apply</button>
              <button className="btn ghost" onClick={() => {
                setQuery(''); setLocationFilter(''); setMinPrice(''); setMaxPrice(''); setGuests(''); setBedrooms('');
                setPetsAllowed('any');
                const reset: Record<string, boolean> = {};
                ALL_AMENITIES.forEach((a) => (reset[a] = false));
                reset['wifi'] = true; reset['tv'] = true;
                setAmenities(reset);
                setSort('price_asc');
              }}>Reset</button>
            </div>
          </div>
        </aside>

        <section>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="results-count">{loadingRooms ? 'Loading rooms…' : `${totalRooms} rooms found`}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="muted">Page</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: '#fbfbff' }}>{page}/{totalPages}</div>
                  <button className="btn ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
                </div>
              </div>
            </div>
          </div>

          {err && <div className="card" style={{ marginBottom: 12, color: '#b71c1c' }}>{err}</div>}

          <div className="rooms-grid">
            {loadingRooms ? Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />) : rooms.map((r) => <RoomCard key={r.id} room={r} />)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <div className="muted">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalRooms)} of {totalRooms}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={() => setPage(1)} disabled={page === 1}>First</button>
              <button className="btn ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <button className="btn ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              <button className="btn ghost" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            </div>
          </div>
        </section>
      </div>

      {/* Detail Drawer */}
      <RoomDetailDrawer room={selectedRoom} isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedRoom(null); }} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      {/* Floating cart button */}
      <div style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 1400 }}>
        <button className="btn primary" onClick={() => setCartOpen(true)} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M7 4h-2l-3 7v2h2l1.2 6h13.6l1.2-6h2v-2l-3-7h-2l-1 3h-8l-1-3zm1.2 6h8.8l.8 4h-10.4l.8-4z"/></svg>
          Cart ({cart.length})
        </button>
      </div>
    </div>
  );
}
