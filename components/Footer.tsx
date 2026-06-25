'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MessageCircle, Globe, Users } from 'lucide-react';

/*
  ╔════════════════════════════════════════════════════════════════════╗
  ║  MAYFAIR — FOOTER v2                                               ║
  ║  • Scroll-triggered reveal: every section enters as it comes     ║
  ║    into the viewport (IntersectionObserver, no deps).            ║
  ║  • Large cinematic "MAYFAIR" type scales from a huge watermark   ║
  ║    background to the logo — same motion language as the hero.    ║
  ║  • Contact cards lift and reveal on hover with crimson accents.  ║
  ║  • Animated marquee strip of brand values runs beneath the map.  ║
  ║  • Staggered line-by-line entrance for the statement copy.       ║
  ╚════════════════════════════════════════════════════════════════════╝
*/

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const CRIMSON   = '#6D001A';
const GOLD      = '#c9a96e';

// ─── Marquee data ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Architectural Excellence',
  '·',
  'Refined Luxury',
  '·',
  'World-Class Service',
  '·',
  'Curated Experience',
  '·',
  'Timeless Design',
  '·',
  'London Mayfair',
  '·',
  'Est. 2020',
  '·',
];

// ─── useInView hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Animated reveal wrapper ──────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const { ref, inView } = useInView(0.1);

  const dirMap = {
    up:    'translateY(32px)',
    left:  'translateX(-28px)',
    right: 'translateX(28px)',
    none:  'translateY(0)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translate(0,0)' : dirMap[direction],
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({
  icon,
  label,
  value,
  href,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <a
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex flex-col gap-3 p-5 sm:p-6 border rounded-2xl transition-all duration-500 cursor-pointer no-underline"
        style={{
          background:   hovered ? `rgba(109,0,26,0.10)` : 'rgba(255,255,255,0.02)',
          borderColor:  hovered ? `${CRIMSON}60`        : 'rgba(255,255,255,0.06)',
          transform:    hovered ? 'translateY(-5px)'    : 'translateY(0)',
          boxShadow:    hovered ? `0 20px 50px rgba(109,0,26,0.18)` : 'none',
          transition:   'all 0.45s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400"
          style={{
            background:  hovered ? `${CRIMSON}30` : 'rgba(255,255,255,0.04)',
            borderColor: hovered ? `${CRIMSON}50` : 'rgba(255,255,255,0.06)',
            border:      '1px solid',
            color:       hovered ? GOLD : 'rgba(255,255,255,0.35)',
          }}
        >
          {icon}
        </div>

        {/* Label */}
        <span
          className="text-[9px] font-bold uppercase tracking-[0.4em]"
          style={{ color: hovered ? GOLD : CRIMSON }}
        >
          {label}
        </span>

        {/* Value */}
        <span
          className="font-serif text-base sm:text-lg leading-snug transition-colors duration-300"
          style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.7)' }}
        >
          {value}
        </span>

        {/* Subtle arrow */}
        <span
          className="text-[10px] uppercase tracking-[0.3em] mt-1 transition-all duration-300 flex items-center gap-1.5"
          style={{
            color:     hovered ? GOLD : 'transparent',
            transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
          }}
        >
          Get in touch
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </a>
    </div>
  );
}

// ─── Marquee strip ────────────────────────────────────────────────────────────
function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]; // double for seamless loop

  return (
    <div className="relative overflow-hidden w-full py-4 border-y" style={{ borderColor: 'rgba(109,0,26,0.18)' }}>
      {/* Left / right fade masks */}
      <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }} />
      <div className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }} />

      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'mfMarquee 28s linear infinite' }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="mx-6 text-[9px] uppercase tracking-[0.45em] font-bold shrink-0"
            style={{ color: item === '·' ? CRIMSON : 'rgba(255,255,255,0.22)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main footer ──────────────────────────────────────────────────────────────
export default function Footer() {
  const { ref: stmtRef, inView: stmtInView } = useInView(0.1);

  // Statement lines animate in one by one
  const stmtLines = [
    { text: 'Every detail.', color: 'rgba(255,255,255,0.85)', delay: 0 },
    { text: 'Every moment.', color: 'rgba(255,255,255,0.55)', delay: 180 },
    { text: 'Every stay.', color: CRIMSON, delay: 360 },
  ];

  return (
    <>
      {/* Inject marquee keyframe */}
      <style>{`
        @keyframes mfMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes mfCounterUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <footer
        className="w-full overflow-hidden"
        style={{ background: '#0A0A0A' }}
      >

        {/* ══ CINEMATIC STATEMENT BLOCK ══════════════════════════════════════ */}
        <div
          ref={stmtRef}
          className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            paddingTop:    'clamp(80px, 12vh, 160px)',
            paddingBottom: 'clamp(60px, 8vh, 120px)',
            borderBottom:  '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Giant watermark "MAYFAIR" — same quiet depth as hero */}
          <div
            style={{
              position:   'absolute',
              inset:       0,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              overflow: 'hidden',
              opacity: stmtInView ? 0.022 : 0,
              transition: 'opacity 1.4s ease-out',
            }}
          >
            <span
              className="font-serif font-black uppercase text-white select-none"
              style={{
                fontSize:      'clamp(14vw, 18vw, 22vw)',
                letterSpacing: '0.12em',
                lineHeight:     1,
                transform:     stmtInView ? 'scale(1)' : 'scale(1.06)',
                transition:    'transform 1.6s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              MAYFAIR
            </span>
          </div>

          {/* Thin crimson rule above */}
          <div
            style={{
              width:      stmtInView ? '48px' : '0px',
              height:     '1px',
              background: `linear-gradient(90deg, transparent, ${CRIMSON}, transparent)`,
              marginBottom: '32px',
              transition: 'width 1s cubic-bezier(0.16,1,0.3,1) 200ms',
            }}
          />

          {/* Statement lines */}
          <div className="flex flex-col gap-2 relative z-10">
            {stmtLines.map((line, i) => (
              <div
                key={i}
                style={{
                  opacity:    stmtInView ? 1 : 0,
                  transform:  stmtInView ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${line.delay + 300}ms,
                               transform 0.9s cubic-bezier(0.16,1,0.3,1) ${line.delay + 300}ms`,
                  color: line.color,
                }}
              >
                <span
                  className="font-serif uppercase"
                  style={{
                    fontSize:      'clamp(2.4rem, 5.5vw, 7rem)',
                    fontWeight:    200,
                    letterSpacing: '0.12em',
                    lineHeight:    1.12,
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>

          {/* Eyebrow beneath */}
          <div
            style={{
              opacity:    stmtInView ? 0.4 : 0,
              transform:  stmtInView ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.8s ease-out 900ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 900ms',
              marginTop:  '28px',
            }}
            className="flex items-center gap-4 relative z-10"
          >
            <div style={{ width: 28, height: 1, background: GOLD }} />
            <span
              className="text-[9px] uppercase font-bold tracking-[0.5em]"
              style={{ color: GOLD }}
            >
              Mayfair, London
            </span>
            <div style={{ width: 28, height: 1, background: GOLD }} />
          </div>
        </div>

        {/* ══ MARQUEE STRIP ══════════════════════════════════════════════════ */}
        <Marquee />

        {/* ══ MAIN CONTENT GRID ══════════════════════════════════════════════ */}
        <div
          className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-16"
          style={{ paddingTop: 'clamp(60px,8vh,100px)', paddingBottom: '40px' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* ── COL 1: Brand block ─────────────────────────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              <Reveal direction="left" delay={0}>
                <div
                  className="border-l pl-6 pb-2"
                  style={{ borderColor: CRIMSON }}
                >
                  <h2
                    className="font-serif uppercase text-white tracking-[0.22em] mb-3"
                    style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)', fontWeight: 300 }}
                  >
                    Mayfair
                  </h2>
                  <p
                    className="text-[10px] uppercase tracking-[0.42em] font-bold"
                    style={{ color: GOLD }}
                  >
                    Architectural Excellence
                  </p>
                  <p
                    className="mt-4 text-[11px] leading-relaxed tracking-wide"
                    style={{ color: 'rgba(255,255,255,0.3)', maxWidth: '220px' }}
                  >
                    A sanctuary of understated luxury in the heart of London's most distinguished district.
                  </p>
                </div>
              </Reveal>

              {/* Social row */}
              <Reveal direction="left" delay={120}>
                <div className="flex gap-3">
                  {[
                    { icon: <Globe size={15} />, label: 'Instagram', href: '#' },
                    { icon: <Users size={15} />, label: 'Facebook',  href: '#' },
                    { icon: <MessageCircle size={15} />, label: 'WhatsApp', href: 'https://wa.me/0712345678' },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      title={s.label}
                      className="group flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-400"
                      style={{
                        borderColor: 'rgba(255,255,255,0.07)',
                        color:        'rgba(255,255,255,0.3)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${CRIMSON}70`;
                        (e.currentTarget as HTMLElement).style.color = GOLD;
                        (e.currentTarget as HTMLElement).style.background = `rgba(109,0,26,0.12)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ── COL 2: Contact cards ───────────────────────────────────── */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <ContactCard
                icon={<Mail size={16} />}
                label="Email"
                value="mayfairhotels@gmail.com"
                href="mailto:mayfairhotels@gmail.com"
                delay={80}
              />
              <ContactCard
                icon={<Phone size={16} />}
                label="Direct Line"
                value="0787 654 321"
                href="tel:0787654321"
                delay={180}
              />
              <ContactCard
                icon={<MessageCircle size={16} />}
                label="WhatsApp"
                value="0712 345 678"
                href="https://wa.me/0712345678"
                delay={280}
              />
            </div>

            {/* ── COL 3: Map + location ──────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <Reveal direction="right" delay={60}>
                <div
                  className="relative overflow-hidden rounded-2xl border"
                  style={{
                    height:      'clamp(220px, 28vh, 320px)',
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Map */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.246241774218!2d-0.1465228!3d51.5086111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876052989182307%3A0x67586e373468574a!2sMayfair%2C%20London!5e0!3m2!1sen!2suk!4v1718712345678!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{
                      border:  0,
                      filter:  'grayscale(1) invert(0.88) contrast(1.15) brightness(0.9)',
                      opacity:  0.55,
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {/* Overlay vignette */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.7) 100%)`,
                    }}
                  />

                  {/* Location pin label */}
                  <div
                    className="absolute bottom-4 left-4 flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{
                      background:     'rgba(10,10,10,0.75)',
                      backdropFilter: 'blur(10px)',
                      border:         '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: CRIMSON }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-[11px] font-semibold tracking-wide">Mayfair District</span>
                      <span className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>London, W1J</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Stats row */}
              <Reveal direction="up" delay={200}>
                <div
                  className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  {[
                    { num: '24 / 7', label: 'Concierge' },
                    { num: '120+',   label: 'Suites' },
                    { num: '5★',     label: 'Rating' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center text-center py-5 px-3"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <span
                        className="font-serif font-bold tracking-wide"
                        style={{ fontSize: 'clamp(1rem, 1.6vw, 1.4rem)', color: '#fff' }}
                      >
                        {stat.num}
                      </span>
                      <span
                        className="text-[9px] uppercase tracking-[0.38em] mt-1"
                        style={{ color: GOLD, opacity: 0.7 }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

          </div>

          {/* ══ BOTTOM STRIP ══════════════════════════════════════════════════ */}
          <div
            className="flex flex-col sm:flex-row justify-between items-center gap-5 mt-16 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <Reveal direction="none" delay={0}>
              <p
                className="text-[9px] uppercase tracking-[0.48em]"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                © 2026 Mayfair Hotels. All Rights Reserved.
              </p>
            </Reveal>

            <Reveal direction="none" delay={100}>
              <div className="flex gap-8 sm:gap-12">
                {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((link, i) => (
                  <a
                    key={i}
                    href="#"
                    className="text-[9px] uppercase tracking-[0.45em] transition-colors duration-300"
                    style={{ color: 'rgba(255,255,255,0.18)' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.18)'; }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

        </div>
      </footer>
    </>
  );
}