'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * experiences.tsx
 *
 * Full drop-in component implementing the features you requested.
 *
 * Placeholders expected in /public:
 *  - /placeholder.jpg
 *  - /portrait1.mp4
 *  - /portrait2.mp4
 *  - /portrait3.mp4
 *  - slide images (Hotel.jpg, Bedroom 1.jpg, Lobby.jpg, Hotel Food.jpeg, Confrence Room.jpg, Gym 2.jpg, Views.jpg, Front Desk.jpg)
 *
 * Usage:
 *  - Render <ExperiencesFull /> in your page.
 *
 * Notes:
 *  - Navigation uses window.location.href. If you'd prefer Next.js router (router.push), tell me and I will change it.
 *  - Prefers-reduced-motion is respected.
 */

/* ============================================================
   DESIGN TOKENS & MOTION TUNING
   ============================================================ */
const TOKENS = {
  crimson: '#6D001A',
  deep: '#3A0353',
  gold: '#E5C494',
  gold2: '#F59E51',
  purple: '#804A8A',
  bg: '#070308',
  text: '#FFFFFF',
  ease: 'cubic-bezier(.16,1,.3,1)',
};

const MOTION = {
  prefersReduced: typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  autoScrollPxPerSec: 48,
  hoverPauseMs: 220,
  dragThreshold: 6,
  snapIdleMs: 320,
  springK: 0.14,
  damping: 0.86,
};

/* ============================================================
   UTILITIES
   ============================================================ */
function nowMs() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }
function clamp(n: number, a = 0, b = 1) { return Math.max(a, Math.min(b, n)); }
function encodePath(p?: string) { return p ? encodeURI(p) : '/placeholder.jpg'; }
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function goto(path: string) { window.location.href = path; }
function formatKsh(amount: number | string) {
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, '')) || 0;
  return `Ksh ${n.toLocaleString('en-KE')}`;
}
function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ============================================================
   PREFERS REDUCED MOTION HOOK
   ============================================================ */
function usePrefersReducedMotion() {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPref(mq.matches);
    const handler = () => setPref(mq.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return pref;
}

/* ============================================================
   REVEAL (IntersectionObserver)
   Works for scroll up and down
   ============================================================ */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({ children, delay = 0, distance = 20 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0px)' : `translateY(${distance}px)`,
      transition: `opacity 640ms ${TOKENS.ease} ${delay}ms, transform 640ms ${TOKENS.ease} ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

/* ============================================================
   GlowButton
   Multicolor glow on hover using palette
   ============================================================ */
const GlowButton: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; ariaLabel?: string }> = ({ children, onClick, variant = 'primary', ariaLabel }) => {
  const [hover, setHover] = useState(false);
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12,
    fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
    border: 'none', outline: 'none', position: 'relative', overflow: 'hidden', transition: `transform 260ms ${TOKENS.ease}, box-shadow 260ms ${TOKENS.ease}`, color: '#fff',
  };
  const primary: React.CSSProperties = {
    background: `linear-gradient(90deg, ${TOKENS.crimson}, ${TOKENS.deep})`,
    boxShadow: hover ? `0 6px 30px rgba(109,0,26,0.28), 0 0 40px ${hexToRgba(TOKENS.gold, 0.12)}, 0 0 90px ${hexToRgba(TOKENS.purple, 0.06)}` : '0 4px 16px rgba(109,0,26,0.22)',
    transform: hover ? 'translateY(-2px)' : 'translateY(0)',
  };
  const ghost: React.CSSProperties = {
    background: hover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: hover ? `0 8px 32px rgba(0,0,0,0.5), 0 0 48px ${hexToRgba(TOKENS.gold2, 0.06)}` : undefined,
    transform: hover ? 'translateY(-1px)' : 'translateY(0)',
  };
  const style = { ...(base as any), ...(variant === 'primary' ? primary : ghost) };
  return (
    <button aria-label={ariaLabel} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={style} type="button">
      <span style={{
        position: 'absolute', left: '-60%', top: 0, bottom: 0, width: '60%',
        background: `linear-gradient(90deg, ${TOKENS.gold} 0%, ${TOKENS.gold2} 40%, ${TOKENS.purple} 80%)`,
        transform: hover ? 'translateX(320%)' : 'translateX(0)', opacity: 0.12, transition: `transform 700ms ${TOKENS.ease}`
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
};

/* ============================================================
   TypewriterText - reusable
   ============================================================ */
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 36 }) => {
  const [out, setOut] = useState('');
  useEffect(() => {
    let alive = true;
    let i = 0;
    const tick = () => {
      if (!alive) return;
      setOut(text.slice(0, i));
      if (i <= text.length) {
        i++;
        setTimeout(tick, speed + (i % 6 === 0 ? 12 : 0));
      }
    };
    tick();
    return () => { alive = false; };
  }, [text, speed]);
  return <span style={{ fontFamily: 'serif' }}>{out}<span style={{ display: 'inline-block', width: 6, height: 18, background: '#fff', marginLeft: 6, verticalAlign: 'middle', opacity: 0.9, animation: 'mfCursor 1s steps(2,end) infinite' }} /></span>;
};

/* small cursor keyframe style injected in final render */

/* ============================================================
   RoomCardLarge - TypeScript-safe component
   ============================================================ */
type Room = { name: string; desc?: string; img?: string; price?: number | string; badge?: string };
export const RoomCardLarge: React.FC<{ room: Room; onBook?: () => void }> = ({ room, onBook }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
      border: '1px solid rgba(255,255,255,0.06)', transition: `all 320ms ${TOKENS.ease}`, transform: hover ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hover ? '0 20px 60px rgba(0,0,0,0.6)' : '0 8px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <img src={encodePath(room.img)} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hover ? 'scale(1.06)' : 'scale(1)', transition: `transform 480ms ${TOKENS.ease}` }} />
        {room.badge && <div style={{ position: 'absolute', top: 12, left: 12, background: TOKENS.crimson, color: '#fff', padding: '6px 10px', borderRadius: 99, fontSize: 11 }}>{room.badge}</div>}
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ fontFamily: 'serif', fontSize: 18 }}>{room.name}</h3>
        <p style={{ color: 'rgba(255,255,255,0.72)' }}>{room.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, color: TOKENS.gold }}>{formatKsh(room.price ?? 0)}</div>
          <GlowButton onClick={onBook} variant="ghost">Reserve</GlowButton>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   HighlightsLane - infinite auto-scroll (no vertical lock)
   - Duplicates slides to create seamless loop
   - Pauses on hover; supports dragging horizontally (prevents vertical lock)
   - Clicking a slide invokes onCardClick(item)
   ============================================================ */
type Slide = { src: string; title: string; subtitle?: string; price?: number; images?: string[]; badge?: string; longDesc?: string };
const HighlightsLane: React.FC<{ slides: Slide[]; onCardClick: (s: Slide) => void }> = ({ slides, onCardClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const widthRef = useRef<number>(0);
  const posRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStart = useRef<{ x: number; y: number; pos: number } | null>(null);
  const reduced = usePrefersReducedMotion();

  // duplicated slides for seamless effect
  const allSlides = [...slides, ...slides];

  const computeWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const fullWidth = track.scrollWidth / 2 || 0;
    widthRef.current = fullWidth;
  }, []);

  useEffect(() => {
    computeWidth();
    window.addEventListener('resize', computeWidth);
    const imgs = Array.from(document.images);
    let loaded = 0;
    const onImg = () => { loaded++; if (loaded >= imgs.length) computeWidth(); };
    imgs.forEach(img => { if (img.complete) onImg(); else img.addEventListener('load', onImg); });
    return () => {
      window.removeEventListener('resize', computeWidth);
      imgs.forEach(img => img.removeEventListener('load', onImg));
    };
  }, [computeWidth]);

  // auto scroll loop
  useEffect(() => {
    if (reduced) return;
    let last = nowMs();
    const step = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!pausedRef.current && !draggingRef.current) {
        posRef.current += MOTION.autoScrollPxPerSec * dt;
        if (widthRef.current && posRef.current >= widthRef.current) posRef.current -= widthRef.current;
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [reduced]);

  // pointer drag & hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerEnter = () => { pausedRef.current = true; };
    const onPointerLeave = () => { if (!draggingRef.current) pausedRef.current = false; };

    const onPointerDown = (ev: PointerEvent) => {
      draggingRef.current = true;
      dragStart.current = { x: ev.clientX, y: ev.clientY, pos: posRef.current };
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current || !dragStart.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      // only treat as horizontal drag if horizontal dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MOTION.dragThreshold) {
        ev.preventDefault();
        posRef.current = clamp(dragStart.current.pos - dx, 0, widthRef.current || 0);
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      draggingRef.current = false;
      dragStart.current = null;
      try { (ev.target as Element).releasePointerCapture?.(ev.pointerId); } catch {}
      setTimeout(() => { if (!pausedRef.current) pausedRef.current = false; }, MOTION.hoverPauseMs);
    };

    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onPointerDown as any);
    window.addEventListener('pointermove', onPointerMove as any);
    window.addEventListener('pointerup', onPointerUp as any);

    return () => {
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown as any);
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp as any);
    };
  }, []);

  // Render lane
  return (
    <section style={{ padding: '28px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px 16px' }}>
        <div style={{ color: TOKENS.gold, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>Highlights</div>
        <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 300, marginTop: 8 }}>Infinite Highlights</h2>
      </div>

      <div ref={containerRef} style={{ width: '100%', overflow: 'hidden', WebkitOverflowScrolling: 'touch', marginTop: 18 }}>
        <div ref={trackRef} style={{ display: 'flex', gap: 28, padding: '12px 48px', willChange: 'transform', transform: 'translateX(0px)' }}>
          {allSlides.map((s, i) => {
            const originalIndex = i % slides.length;
            return (
              <article key={i} onClick={() => onCardClick(slides[originalIndex])} style={{
                minWidth: 520, flex: '0 0 auto', cursor: 'pointer', borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 40px rgba(0,0,0,0.46)',
              }}>
                <div style={{ position: 'relative', height: 320 }}>
                  <img src={encodePath(s.src)} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.62), transparent 40%)' }} />
                  <div style={{ position: 'absolute', left: 18, bottom: 18, color: '#fff' }}>
                    <div style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 13 }}>{s.subtitle}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   ExpandModal - animated expand when card clicked
   ============================================================ */
const ExpandModal: React.FC<{ item: Slide | null; open: boolean; onClose: () => void }> = ({ item, open, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      ref.current?.focus?.();
      return () => prev?.focus?.();
    }
  }, [open]);
  if (!open || !item) return null;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div ref={ref} tabIndex={-1} style={{ width: 'min(1100px, 96vw)', borderRadius: 14, overflow: 'hidden', display: 'flex', boxShadow: '0 40px 120px rgba(0,0,0,0.8)', background: 'linear-gradient(180deg,#0b0a0d,#080508)', transform: 'translateY(0) scale(1)', animation: 'mfExpandIn 520ms ' + TOKENS.ease }}>
        <style>{`@keyframes mfExpandIn{0%{transform:translateY(10px) scale(.96);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}`}</style>
        <div style={{ width: '55%', minHeight: 420, background: '#000' }}>
          <img src={encodePath(item.images?.[0] ?? item.src)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ width: '45%', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontFamily: 'serif', fontSize: 22 }}>{item.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.82)' }}>{item.longDesc ?? item.subtitle ?? item.subtitle}</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
            <GlowButton onClick={() => goto('/rooms')}>View Rooms</GlowButton>
            <GlowButton onClick={() => goto('/bookings')} variant="ghost">Book</GlowButton>
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 8, color: '#fff' }}>Close</button>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Gallery</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(item.images ?? [item.src]).map((u, i) => <img key={i} src={encodePath(u)} alt={`thumb-${i}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CollageWithGlow - multicolor glow button on hover
   ============================================================ */
const CollageWithGlow: React.FC<{ items: { title: string; blurb: string; img: string }[] }> = ({ items }) => {
  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ color: TOKENS.gold, textTransform: 'uppercase', fontSize: 11 }}>Selected Moments</div>
        <h2 style={{ fontFamily: 'serif', fontWeight: 300, fontSize: 'clamp(24px,3.6vw,40px)', marginTop: 8 }}>Collage</h2>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {items.map((it, i) => (
            <div key={i} className="mf-collage-item" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={encodePath(it.img)} alt={it.title} style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', left: 18, bottom: 18, color: '#fff' }}>
                <div style={{ fontFamily: 'serif', fontSize: 18 }}>{it.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{it.blurb}</div>
              </div>

              <div style={{ position: 'absolute', right: 18, top: 18, opacity: 0, transform: 'translateY(-6px)', transition: `opacity 320ms ${TOKENS.ease}, transform 320ms ${TOKENS.ease}` }} className="mf-collage-cta">
                <button onClick={() => goto('/experiences')} style={{ padding: '8px 12px', borderRadius: 12, border: 'none', background: `linear-gradient(90deg, ${TOKENS.gold}, ${TOKENS.gold2})`, color: '#000', fontWeight: 700 }}>Explore</button>
              </div>

              <style>{`
                .mf-collage-item:hover .mf-collage-cta { opacity: 1; transform: translateY(0); filter: drop-shadow(0 12px 40px ${hexToRgba(TOKENS.gold2,0.12)}), drop-shadow(0 8px 30px ${hexToRgba(TOKENS.purple,0.06)}); }
                .mf-collage-item:hover { transform: translateY(-6px); transition: transform 320ms ${TOKENS.ease}; box-shadow: 0 20px 80px rgba(0,0,0,0.6), 0 0 40px ${hexToRgba(TOKENS.gold2,0.06)}, 0 0 80px ${hexToRgba(TOKENS.purple,0.04)}; }
                @media (prefers-reduced-motion: reduce) { .mf-collage-item, .mf-collage-cta { transition: none !important; } }
              `}</style>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   PortraitReels - 1 tall + 2 squares. Open full video modal on click.
   ============================================================ */
const PortraitReels: React.FC<{ videos: { src: string; poster?: string; title?: string; typewriterText?: string }[] }> = ({ videos }) => {
  const [open, setOpen] = useState<{ src: string; text?: string } | null>(null);

  return (
    <section style={{ padding: '48px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <style>{`
        .mf-portrait-grid { display: grid; grid-template-columns: 1fr 420px; gap: 18px; align-items: start; }
        .mf-portrait-left { height: 70vh; border-radius: 12px; overflow: hidden; position: relative; }
        .mf-portrait-right { display: grid; grid-template-rows: 34vh 34vh; gap: 18px; }
        .mf-portrait-rect { border-radius: 12px; overflow: hidden; position: relative; height: 100%; }
        @media (max-width: 900px) {
          .mf-portrait-grid { grid-template-columns: 1fr; }
          .mf-portrait-right { grid-template-rows: auto auto; }
          .mf-portrait-left { height: 56vh; }
          .mf-portrait-rect { height: 36vh; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ color: TOKENS.gold, fontSize: 11, textTransform: 'uppercase' }}>Portrait Reels</div>
        <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(24px, 3.6vw, 36px)', marginTop: 8 }}>The feeling of Mayfair</h2>

        <div className="mf-portrait-grid" style={{ marginTop: 18 }}>
          {/* LEFT: Tall rectangle (first video remains full) */}
          <div className="mf-portrait-left">
            <video
              src={videos[0]?.src || '/portrait1.mp4'}
              poster={videos[0]?.poster || '/placeholder.jpg'}
              muted
              loop
              playsInline
              autoPlay
              aria-label={videos[0]?.title || 'Portrait 1'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'end', justifyContent: 'center', paddingBottom: 20 }}>
              <GlowButton onClick={() => setOpen({ src: videos[0]?.src || '/portrait1.mp4', text: videos[0]?.typewriterText })}>
                Watch full
              </GlowButton>
            </div>
          </div>

          {/* RIGHT: Two stacked rectangles (videos 2 and 3) */}
          <div className="mf-portrait-right">
            {[1, 2].map(i => (
              <div key={i} className="mf-portrait-rect">
                <video
                  src={videos[i]?.src || (i === 1 ? '/portrait2.mp4' : '/portrait3.mp4')}
                  poster={videos[i]?.poster || '/placeholder.jpg'}
                  muted
                  loop
                  playsInline
                  autoPlay
                  aria-label={videos[i]?.title || `Portrait ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    onClick={() => setOpen({ src: videos[i]?.src || (i === 1 ? '/portrait2.mp4' : '/portrait3.mp4'), text: videos[i]?.typewriterText })}
                    style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Watch full
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full video modal */}
      {open && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setOpen(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />
          <div style={{ width: 'min(1100px, 96vw)', borderRadius: 12, overflow: 'hidden', background: '#000', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}>
            <video src={open.src} controls autoPlay style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{ padding: 12, color: '#fff' }}>
              <TypewriterText text={open.text || 'A portrait reel that captures the mood.'} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================
   Gifts & Pantry - icon cards that reveal image and CTA on hover
   ============================================================ */
const GiftsPantry: React.FC<{ items: { title: string; subtitle?: string; icon?: string; img?: string; price?: number }[] }> = ({ items }) => {
  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ color: TOKENS.gold, fontSize: 11, textTransform: 'uppercase' }}>Boutique</div>
        <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(24px,3.4vw,36px)' }}>Gifts & Pantry</h2>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 18 }}>
          {items.map((it, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{it.icon || '★'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{it.subtitle}</div>
                </div>
                <div>
                  <GlowButton onClick={() => window.open(it.img || '/placeholder.jpg', '_blank')} variant="ghost">Open</GlowButton>
                </div>
              </div>
              <div style={{ height: 120, overflow: 'hidden' }}>
                <img src={encodePath(it.img)} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Testimonials with typewriter per quote
   ============================================================ */
const Testimonials: React.FC<{ items: { quote: string; author: string }[] }> = ({ items }) => {
  const [idx, setIdx] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 5600);
    return () => clearInterval(t);
  }, [items.length, reduced]);
  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ color: TOKENS.gold, fontSize: 11, textTransform: 'uppercase' }}>Praise</div>
        <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(24px,3.4vw,36px)' }}>What guests say</h2>
        <div style={{ marginTop: 18, padding: 24, background: 'linear-gradient(160deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ fontSize: 36, color: TOKENS.gold, opacity: 0.32, fontFamily: 'serif' }}>“</div>
            <div style={{ flex: 1 }}>
              <TypewriterText text={items[idx].quote} speed={34} />
              <div style={{ marginTop: 8, color: TOKENS.gold, fontWeight: 700 }}>{items[idx].author}</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {items.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 99, background: i === idx ? TOKENS.gold : 'rgba(255,255,255,0.12)', border: 'none' }} />)}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Main Assembly: ExperiencesFull
   ============================================================ */
export default function ExperiencesFull(): React.ReactElement {
  const reduced = usePrefersReducedMotion();

  // hero typewriter activation
  const [typeActive, setTypeActive] = useState(false);
  useEffect(() => {
    const el = document.getElementById('mf-hero');
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setTypeActive(true); }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const headline = 'An Architectural Sanctuary';
  const subline = 'Mayfair — refined geometry, deep stillness, and the art of considered craft.';

  // highlight slides (uses filenames you already added to /public)
  const slides: Slide[] = [
    { src: '/Hotel.jpg', title: 'Welcome to Mayfair', subtitle: 'Warm hospitality & world-class service.', price: 0, images: ['/Hotel.jpg'] },
    { src: '/Bedroom 1.jpg', title: 'Luxury Guest Rooms', subtitle: 'Relax in beautifully designed guest suites.', price: 69000, images: ['/Bedroom 1.jpg'] },
    { src: '/Lobby.jpg', title: 'Premium Lounges', subtitle: 'Quiet common areas to relax or work.', price: 0, images: ['/Lobby.jpg'] },
    { src: '/Hotel Food.jpeg', title: 'Fine Dining', subtitle: 'Fresh meals crafted daily.', price: 2500, images: ['/Hotel Food.jpeg'] },
    { src: '/Confrence Room.jpg', title: 'Excellent Events', subtitle: 'Host conferences and celebrations.', price: 0, images: ['/Confrence Room.jpg'] },
    { src: '/Gym 2.jpg', title: 'Health & Wellness', subtitle: 'Gym and spa experiences.', price: 0, images: ['/Gym 2.jpg'] },
    { src: '/Views.jpg', title: 'Stunning Views', subtitle: 'Panoramic rooftop lounge.', price: 0, images: ['/Views.jpg'] },
    { src: '/Front Desk.jpg', title: '24/7 Front Desk', subtitle: 'Assistance whenever you need it.', price: 0, images: ['/Front Desk.jpg'] },
  ];

  const collage = [
    { title: 'Library Nook', blurb: 'Quiet reading room', img: '/Hotel Library.jpeg' },
    { title: 'Morning Pantry', blurb: 'Fresh pastries', img: '/Hotel Pantry.jpeg' },
    { title: 'Staffed Concierge', blurb: '24h service', img: '/Hotel Staffing.jpeg' },
    { title: 'Private Dining', blurb: 'Intimate experiences', img: '/Food 2.jpeg' },
  ];

  const rooms: Room[] = [
    { name: 'Signature Suite', desc: 'Two-bedroom sanctuary', img: '/Hotel Suite.jpeg', price: 69000, badge: 'Top' },
    { name: 'Executive King', desc: 'Work-ready room', img: '/King Hotel room.jpeg', price: 34000 },
    { name: 'Deluxe Twin', desc: 'Flexible sleeping', img: '/Twin Room.jpeg', price: 28000 },
  ];

  const shop = [
    { title: 'Signature Candle', subtitle: 'Scented', icon: '🕯️', img: '/Signature Candle.jpeg', price: 2900 },
    { title: 'Artisan Chocolate', subtitle: 'Handmade', icon: '🍫', img: '/Artisan Chocolate.jpeg', price: 1200 },
    { title: 'Mayfair Robe', subtitle: 'Soft', icon: '🧥', img: '/Robes.jpeg', price: 8900 },
  ];

  const portraits = [
    { src: '/Video Card 1.mp4', poster: '/placeholder.jpg', title: 'Suite Reel', typewriterText: 'Light, stillness, design.' },
    { src: '/Video Card 2.mp4', poster: '/placeholder.jpg', title: 'Kitchen Reel', typewriterText: 'Heat, craft, flavor.' },
    { src: '/Video Card 3.mp4', poster: '/placeholder.jpg', title: 'Spa Reel', typewriterText: 'Restore, repeat.' },
  ];

  const testimonials = [
    { quote: 'Every detail felt curated with care.', author: 'L. Mwangi' },
    { quote: 'Remarkable service and restful nights.', author: 'A. Kim' },
    { quote: 'We stayed and returned — twice.', author: 'S. Patel' },
    { quote: 'The rooftop view is unforgettable.', author: 'J. Mburu' },
    { quote: 'Comfort, service, and quiet — perfect.', author: 'M. Ochieng' },
  ];

  // modal state
  const [expanded, setExpanded] = useState<{ open: boolean; item: Slide | null }>({ open: false, item: null });
  const openExpand = (s: Slide) => setExpanded({ open: true, item: s });
  const closeExpand = () => setExpanded({ open: false, item: null });

  return (
    <>
      <style>{`
        :root { --mf-bg: ${TOKENS.bg}; --mf-text: ${TOKENS.text}; }
        .mf-root { background: var(--mf-bg); color: var(--mf-text); min-height: 100vh; overflow-x: hidden; }
        ::selection { background: ${TOKENS.crimson}; color: #fff; }
        @keyframes mfCursor { 0%,100%{opacity:1}50%{opacity:0} }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      <main className="mf-root">
        {/* HERO */}
        <section id="mf-hero" style={{ minHeight: '84vh', padding: '72px 48px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '50%', top: '8%', transform: 'translateX(-50%)', fontFamily: 'serif', fontSize: '18vw', color: '#fff', opacity: 0.04, pointerEvents: 'none' }}>IMMERSIVE</div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
            <Reveal><div style={{ display: 'inline-flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(229,196,148,0.12)' }}><div style={{ width: 8, height: 8, borderRadius: 99, background: TOKENS.gold }} /><div style={{ fontSize: 11, letterSpacing: '.18em', color: TOKENS.gold }}>Mayfair Collection</div></div></Reveal>
            <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(36px,7vw,88px)', fontWeight: 300, marginTop: 18 }}>{headline}</h1>
            <Reveal delay={80}><p style={{ color: 'rgba(255,255,255,0.66)', maxWidth: 680 }}>{subline}</p></Reveal>
            <Reveal delay={160}><div style={{ marginTop: 24, display: 'flex', gap: 12 }}><GlowButton onClick={() => goto('/bookings')}>Reserve a Room</GlowButton><GlowButton onClick={() => goto('/experiences')} variant="ghost">Explore Experiences</GlowButton></div></Reveal>
          </div>
        </section>

        {/* Highlights lane */}
        <HighlightsLane slides={slides} onCardClick={openExpand} />

        {/* Collage */}
        <CollageWithGlow items={collage} />

        {/* Rooms (restful geometry) */}
        <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
            <div style={{ color: TOKENS.gold, fontSize: 11, textTransform: 'uppercase' }}>Rooms & Suites</div>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(28px,4vw,46px)', marginTop: 8 }}>Restful geometry</h2>
            <div style={{ marginTop: 18, display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 8 }}>
              {rooms.map((r, i) => <div key={i} style={{ width: 360 }}><RoomCardLarge room={r} onBook={() => goto('/rooms')} /></div>)}
            </div>
          </div>
        </section>

        {/* Portrait reels */}
        <PortraitReels videos={portraits} />

        {/* Gifts & Pantry */}
        <GiftsPantry items={shop} />

        {/* Testimonials */}
        <Testimonials items={testimonials} />

        <div style={{ height: 120 }} />
      </main>

      {/* Expand modal */}
      <ExpandModal item={expanded.item} open={expanded.open} onClose={closeExpand} />
    </>
  );
}