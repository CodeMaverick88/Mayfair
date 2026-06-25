'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  MAYFAIR — HERO v3                                               ║
  ║  • No motion blur anywhere                                       ║
  ║  • Slower typewriters (130ms video / 220ms left panel)          ║
  ║  • Toned-down watermark and chip colors                         ║
  ║  • Silkier spring physics (friction 0.055)                      ║
  ║  • Staggered left-panel entrance (eyebrow → headline → body)   ║
  ╚══════════════════════════════════════════════════════════════════╝
*/

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const CRIMSON    = '#6D001A';
const CRIMSON_DIM = '#5a0015';
const GOLD       = '#E5C494';
const GOLD_MUTED = '#c9a96e';

// ─── Ease helpers ─────────────────────────────────────────────────────────────
const easeOutCubic    = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic  = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─── useTypewriter — ref-based, no stale closure ──────────────────────────────
function useTypewriter(target: string, active: boolean, speed = 130) {
  const [text, setText]   = useState('');
  const idxRef            = useRef(0);
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!active) { stop(); idxRef.current = 0; setText(''); return; }
    if (idxRef.current >= target.length) return;

    const tick = () => {
      idxRef.current += 1;
      setText(target.slice(0, idxRef.current));
      if (idxRef.current < target.length) {
        timerRef.current = setTimeout(tick, speed);
      }
    };
    timerRef.current = setTimeout(tick, speed);
    return stop;
  }, [active, target, speed, stop]);

  return { text, done: text.length === target.length && target.length > 0 };
}

// ─── useSequentialTypewriter — lines type one after the other ─────────────────
function useSequentialTypewriter(lines: string[], active: boolean, speed = 220) {
  const [texts,   setTexts]   = useState<string[]>(lines.map(() => ''));
  const [lineIdx, setLineIdx] = useState(0);
  const idxRef   = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      idxRef.current = 0;
      setLineIdx(0);
      setTexts(lines.map(() => ''));
    }
  }, [active]); // eslint-disable-line

  useEffect(() => {
    if (!active || lineIdx >= lines.length) return;
    idxRef.current = 0;
    const target = lines[lineIdx];

    const tick = () => {
      idxRef.current += 1;
      const partial = target.slice(0, idxRef.current);
      setTexts(prev => { const n = [...prev]; n[lineIdx] = partial; return n; });

      if (idxRef.current < target.length) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        // Longer pause between lines — feels deliberate, not rushed
        timerRef.current = setTimeout(() => setLineIdx(l => l + 1), 480);
      }
    };

    timerRef.current = setTimeout(tick, lineIdx === 0 ? 0 : 80);
    return stop;
  }, [active, lineIdx]); // eslint-disable-line

  return texts;
}

// ─── Blinking cursor ──────────────────────────────────────────────────────────
const Cursor = ({ color = CRIMSON }: { color?: string }) => (
  <span
    style={{
      display:        'inline-block',
      width:          '2px',
      height:         '0.75em',
      background:     color,
      marginLeft:     '3px',
      verticalAlign:  'middle',
      borderRadius:   '1px',
    }}
    className="animate-pulse"
  />
);

// ─── Constants ────────────────────────────────────────────────────────────────
const ANIM_DIST = 1100;

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [phx, setPhx] = useState({ progress: 0, velocity: 0, isPast: false });

  const targetScroll  = useRef(0);
  const currentScroll = useRef(0);
  const rafRef        = useRef<number>(0);

  // ── Video typewriter (2 lines, sequential) ───────────────────────────────
  const VIDEO_LINES = [
    'Welcome to Mayfair.',
    'Experience a refined sanctuary of pure luxury.',
  ];
  const [vLineIdx, setVLineIdx] = useState(0);
  const { text: vText, done: vDone } = useTypewriter(
    VIDEO_LINES[vLineIdx] ?? '',
    mounted,
    130  // slower — one char every 130 ms
  );
  useEffect(() => {
    if (vDone && vLineIdx < VIDEO_LINES.length - 1) {
      const t = setTimeout(() => setVLineIdx(i => i + 1), 600);
      return () => clearTimeout(t);
    }
  }, [vDone, vLineIdx]);

  // ── Left panel typewriter (starts after 12% scroll) ──────────────────────
  const LEFT_LINES    = ['IMMERSE', 'YOURSELF IN', 'MAYFAIR'];
  const leftActive    = phx.progress > 0.12;
  const leftTexts     = useSequentialTypewriter(LEFT_LINES, leftActive, 220);

  // ── Mount + RAF spring loop ───────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    const onScroll = () => { targetScroll.current = window.scrollY; };

    const loop = () => {
      // Spring friction: 0.055 → silky, not sluggish
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.055;

      const vel  = targetScroll.current - currentScroll.current;
      const prog = Math.min(1, Math.max(0, currentScroll.current / ANIM_DIST));

      setPhx({ progress: prog, velocity: vel, isPast: targetScroll.current > ANIM_DIST });
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  // ── Derived values ────────────────────────────────────────────────────────
  const p   = phx.progress;
  const ep  = easeInOutCubic(p);
  const eoc = easeOutCubic(p);
  const vel = phx.velocity;

  // Video panel geometry — morphs from fullscreen → right column thumbnail
  const vidW    = phx.isPast ? 48   : 100 - ep * 52;
  const vidH    = phx.isPast ? 30   : 100 - ep * 70;
  const vidTop  = phx.isPast ? 35   : ep  * 35;
  const vidLeft = phx.isPast ? 46   : ep  * 46;

  // Gentle velocity-based vertical drag (no blur, just a tiny Y nudge)
  const velNudge = vel * 0.045;
  // Subtle scale bounce on fast scroll
  const velBounce = 1 + Math.min(0.018, Math.abs(vel) * 0.00014);

  // Left panel alpha — fades in between 10–70% scroll progress
  const leftAlpha    = Math.min(1, Math.max(0, (p - 0.10) / 0.58));
  const leftSlideX   = (1 - easeOutCubic(leftAlpha)) * -36;
  const leftSlideY   = (1 - easeOutCubic(leftAlpha)) * 18 + velNudge;

  // Stagger delays for sub-elements
  const eyebrowAlpha = Math.min(1, Math.max(0, (p - 0.10) / 0.30));
  const bodyAlpha    = Math.min(1, Math.max(0, (p - 0.28) / 0.40));
  const bodySlideY   = (1 - easeOutCubic(Math.min(1, Math.max(0, (p - 0.28) / 0.40)))) * 16;

  // Video overlay fades out as panel shrinks
  const overlayAlpha = Math.max(0, 1 - ep * 3.6);

  // Watermark parallax depth
  const watermarkY   = p * -70;

  return (
    <>
      <style>{`
        @keyframes mfFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mfSlideR {
          from { opacity: 0; transform: translateX(-22px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mfDividerGrow {
          from { width: 0; opacity: 0; }
          to   { width: 52px; opacity: 1; }
        }
        @keyframes subtleGold {
          0%, 100% { opacity: 0.65; }
          50%      { opacity: 0.9; }
        }
        .mf-fade-up     { animation: mfFadeUp  0.75s cubic-bezier(0.16,1,0.3,1) both; }
        .mf-slide-r     { animation: mfSlideR  0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .mf-divider     { animation: mfDividerGrow 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .subtle-gold    { animation: subtleGold 3.2s ease-in-out infinite; }
      `}</style>

      <div
        className="relative bg-white text-black w-full"
        style={{ height: `calc(100vh + ${ANIM_DIST}px)` }}
      >
        <div
          style={{
            position: phx.isPast ? 'absolute' : 'fixed',
            top:      phx.isPast ? `${ANIM_DIST}px` : '0px',
            left: 0,
            width:  '100%',
            height: '100vh',
          }}
          className="overflow-hidden bg-white z-20"
        >

          {/* ── Background watermark — very quiet, parallax depth ────────── */}
          <div
            style={{
              opacity:   leftAlpha * 0.018,        // much quieter than before
              transform: `translateY(${watermarkY}px)`,
              willChange: 'transform, opacity',
            }}
            className="absolute left-[1%] top-[6vh] text-[22vw] font-serif font-black text-black tracking-widest leading-none select-none pointer-events-none z-0 uppercase"
          >
            Immerse
          </div>

          {/* ── Thin crimson accent rule — slides in with panel ─────────── */}
          <div
            style={{
              opacity:         leftAlpha * 0.35,
              transform:       `scaleX(${easeOutCubic(leftAlpha)}) translateY(${leftSlideY * 0.25}px)`,
              transformOrigin: 'left center',
              width:           '22%',
              height:          '1px',
              background:      `linear-gradient(90deg, ${CRIMSON}60, transparent)`,
            }}
            className="absolute left-[6%] sm:left-[8%] top-[33.5vh] z-10"
          />

          {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
          <div
            style={{
              opacity:         leftAlpha,
              transform:       `translateX(${leftSlideX}px) translateY(${leftSlideY}px) scale(${velBounce})`,
              transformOrigin: 'left center',
              willChange:      'transform, opacity',
            }}
            className="absolute left-[6%] sm:left-[8%] top-[35vh] w-[40%] min-w-[240px] max-w-[460px] flex flex-col justify-center pointer-events-none select-none z-10"
          >

            {/* Eyebrow label — staggered fade */}
            <span
              style={{
                color:   GOLD_MUTED,
                opacity: eyebrowAlpha,
                transform: `translateY(${(1 - easeOutCubic(eyebrowAlpha)) * 10}px)`,
              }}
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.58em] mb-4 block subtle-gold"
            >
              The Mayfair Collection
            </span>

            {/* Headline — sequential typewriter */}
            <h2
              className="font-serif uppercase leading-[1.06] tracking-wide"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 5rem)', fontWeight: 200, color: '#111' }}
            >
              {/* Line 1 */}
              <span className="block">
                {leftTexts[0]}
                {leftTexts[0].length > 0 && leftTexts[0].length < LEFT_LINES[0].length && (
                  <Cursor />
                )}
              </span>

              {/* Line 2 */}
              <span className="block">
                {leftTexts[1]}
                {leftTexts[1].length > 0 && leftTexts[1].length < LEFT_LINES[1].length && (
                  <Cursor />
                )}
              </span>

              {/* Line 3 — crimson, the signature moment */}
              <span className="block" style={{ color: CRIMSON }}>
                {leftTexts[2]}
                {leftTexts[2].length > 0 && leftTexts[2].length < LEFT_LINES[2].length && (
                  <Cursor color={CRIMSON_DIM} />
                )}
              </span>
            </h2>

            {/* Divider — animates width in when panel is visible */}
            {leftAlpha > 0.5 && (
              <div
                className="mf-divider my-5 sm:my-6"
                style={{
                  height:     '1px',
                  background: `linear-gradient(90deg, ${CRIMSON}70, transparent)`,
                }}
              />
            )}

            {/* Body copy — delayed stagger */}
            <p
              style={{
                color:     '#777',
                opacity:   bodyAlpha,
                transform: `translateY(${bodySlideY}px)`,
                fontSize:  'clamp(0.6rem, 0.9vw, 0.72rem)',
                letterSpacing: '0.15em',
                lineHeight: 1.8,
                maxWidth:  '290px',
              }}
            >
              Curated architectural layers, perfectly adapted to give lifestyle geometry a beautiful aesthetic direction.
            </p>
          </div>

          {/* ── VIDEO PANEL ──────────────────────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              width:    `${phx.isPast ? 48   : vidW}vw`,
              height:   `${phx.isPast ? 30   : vidH}vh`,
              top:      `${phx.isPast ? 35   : vidTop}vh`,
              left:     `${phx.isPast ? 46   : vidLeft}vw`,
              transform: `translateY(${velNudge * 0.28}px) scale(${velBounce * 0.998})`,
              willChange: 'width, height, top, left, transform',
            }}
            className="shadow-[0_40px_90px_rgba(0,0,0,0.10)] bg-black overflow-hidden z-20"
          >
            {/* Vignette gradient over video */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)',
              }}
            />

            {/* ── VIDEO OVERLAY TEXT ───────────────────────────────────── */}
            <div
              style={{ opacity: overlayAlpha, pointerEvents: 'none' }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 select-none gap-5"
            >
              {/* Eyebrow pill — toned-down, not shouting */}
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full font-bold uppercase subtle-gold"
                style={{
                  fontSize:       'clamp(0.5rem, 0.75vw, 0.65rem)',
                  letterSpacing:  '0.42em',
                  background:     'rgba(109,0,26,0.55)',   // less saturated
                  color:          GOLD_MUTED,
                  border:         `1px solid rgba(229,196,148,0.22)`,
                  backdropFilter: 'blur(6px)',
                }}
              >
                Exclusive Sanctuary
              </span>

              {/* Line 1 — white text on glass card */}
              <div
                style={{
                  background:     'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(12px)',
                  border:         '1px solid rgba(255,255,255,0.07)',
                  borderRadius:   '14px',
                  padding:        '10px 22px',
                  maxWidth:       '80%',
                }}
              >
                <h1
                  className="font-serif uppercase font-bold tracking-[0.22em] leading-snug"
                  style={{
                    fontSize:   'clamp(0.95rem, 2vw, 2.2rem)',
                    color:      '#fff',
                    textShadow: '0 2px 16px rgba(109,0,26,0.45)',
                  }}
                >
                  {vLineIdx === 0 ? (
                    <>{vText}{vText.length < VIDEO_LINES[0].length && <Cursor color={GOLD_MUTED} />}</>
                  ) : (
                    VIDEO_LINES[0]
                  )}
                </h1>
              </div>

              {/* Line 2 — crimson-tinted card, gold text, fades in */}
              {vLineIdx >= 1 && (
                <div
                  className="mf-fade-up"
                  style={{
                    background:     'rgba(109,0,26,0.48)',   // softer than before
                    backdropFilter: 'blur(10px)',
                    border:         `1px solid rgba(229,196,148,0.18)`,
                    borderRadius:   '14px',
                    padding:        '9px 20px',
                    maxWidth:       '74%',
                  }}
                >
                  <p
                    style={{
                      fontSize:      'clamp(0.6rem, 1vw, 0.9rem)',
                      color:         GOLD_MUTED,
                      letterSpacing: '0.17em',
                      lineHeight:    1.75,
                      fontWeight:    300,
                    }}
                  >
                    {vText}
                    {vText.length < VIDEO_LINES[1].length && (
                      <Cursor color={GOLD_MUTED} />
                    )}
                  </p>
                </div>
              )}

              {/* Scroll prompt */}
              <div
                className="absolute bottom-5 flex flex-col items-center gap-2"
                style={{ opacity: 0.42 }}
              >
                <span
                  style={{
                    fontSize:      '0.5rem',
                    color:         GOLD_MUTED,
                    letterSpacing: '0.36em',
                    textTransform: 'uppercase',
                  }}
                >
                  Scroll
                </span>
                <svg
                  className="animate-bounce"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={GOLD_MUTED}
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover scale-105"
              src="/YTDown_YouTube_Luxury-Hotel-Video-Reel-2023_Media_cdKx1Zv3YKs_001_1080p.mp4"
            />
          </div>

        </div>
      </div>
    </>
  );
}