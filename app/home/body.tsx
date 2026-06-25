'use client';

import React, { useEffect, useRef, useState } from 'react';

const CRIMSON = '#6D001A';
const GOLD = '#E5C494';

/**
 * BodySection
 * - Spring-smoothed scroll progress drives subtle parallax + overlay opacity.
 * - Typewriter (title → narrative → amenities) triggered once when section enters view.
 * - Marquee that pauses when section is off-screen or prefers-reduced-motion is set.
 * - No fixed elements that escape the section → will not cover navbar.
 */

function encodePath(p: string) {
  try {
    return encodeURI(p);
  } catch {
    return p;
  }
}

export default function BodySection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);

  // springed progress: targetProgress is updated on scroll; currentProgress interpolates
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0); // 0..1

  // typewriter
  const [typeTriggered, setTypeTriggered] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [typedNarrative, setTypedNarrative] = useState('');
  const [typedAmenitiesLabel, setTypedAmenitiesLabel] = useState('');

  // marquee control (paused when not visible or reduced-motion)
  const [marqueeRunning, setMarqueeRunning] = useState(true);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Content
  const TITLE_TARGET = 'Spatial Concept';
  const NARRATIVE_TARGET =
    'Mayfair is an architectural masterpiece sanctuary. A flawless convergence of raw structural lines, monolithic geometries, and profound stillness designed completely unbothered by external noise.';
  const AMENITIES_TARGET = 'Some of our amenities';

  const imageAssets = [
    { src: '/Pool 1.jpg', name: 'The Hydro Sanctuary' },
    { src: '/Spa 1.jpeg', name: 'The Thermal Vault' },
    { src: '/Spa 2.jpeg', name: 'The Oasis Atrium' },
    { src: '/Gym 5.jpeg', name: 'The Kinetic Lab' },
    { src: '/Food.jpeg', name: 'Culinary Studio' },
    { src: '/Gym 6.jpeg', name: 'Sovereign Fitness' },
    { src: '/Wine 2.jpeg', name: 'Quencher' },
  ];
  const infiniteImages = [...imageAssets, ...imageAssets, ...imageAssets];

  // measure viewport-relative progress for this section
  useEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress when top of the section moves from bottom of viewport to - (height - vh)
      const entryStart = vh;
      const total = rect.height + vh;
      // we'll compute a normalized progress based on how far the top has moved upward
      // clamp 0..1
      const p = Math.max(0, Math.min(1, (vh - rect.top) / total));
      targetRef.current = p;
    };

    // observe intersection to toggle marquee and trigger typewriter
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
          setMarqueeRunning(visible && !prefersReduced);
          if (visible && !typeTriggered) {
            setTypeTriggered(true);
          }
        });
      },
      { threshold: [0, 0.05, 0.2, 0.5] }
    );

    io.observe(container);
    window.addEventListener('scroll', onScroll, { passive: true });
    // initial measure
    onScroll();

    // RAF loop (spring smoothing)
    const spring = () => {
      const target = targetRef.current;
      // spring/friction smoothing
      currentRef.current += (target - currentRef.current) * 0.08; // friction factor (0..1) — lower = softer
      // small clamp to zero-out tiny values
      if (Math.abs(currentRef.current) < 0.0001) currentRef.current = 0;
      setProgress(() => Number(currentRef.current.toFixed(4)));
      rafRef.current = requestAnimationFrame(spring);
    };
    rafRef.current = requestAnimationFrame(spring);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced, typeTriggered]);

  // Multi-stage typewriter (title -> narrative -> label)
  useEffect(() => {
    if (!typeTriggered) return;

    let titleIdx = 0;
    let narrativeIdx = 0;
    let labelIdx = 0;
    let mountedFlag = true;
    setTypedTitle('');
    setTypedNarrative('');
    setTypedAmenitiesLabel('');

    const titleTick = () => {
      if (!mountedFlag) return;
      if (titleIdx < TITLE_TARGET.length) {
        setTypedTitle((s) => s + TITLE_TARGET.charAt(titleIdx));
        titleIdx++;
        setTimeout(titleTick, 80);
      } else {
        // small pause then start narrative
        setTimeout(narrativeTick, 320);
      }
    };

    const narrativeTick = () => {
      if (!mountedFlag) return;
      if (narrativeIdx < NARRATIVE_TARGET.length) {
        setTypedNarrative((s) => s + NARRATIVE_TARGET.charAt(narrativeIdx));
        narrativeIdx++;
        // slightly longer for narrative to feel thoughtful
        setTimeout(narrativeTick, 28);
      } else {
        setTimeout(labelTick, 260);
      }
    };

    const labelTick = () => {
      if (!mountedFlag) return;
      if (labelIdx < AMENITIES_TARGET.length) {
        setTypedAmenitiesLabel((s) => s + AMENITIES_TARGET.charAt(labelIdx));
        labelIdx++;
        setTimeout(labelTick, 100);
      }
    };

    titleTick();

    return () => {
      mountedFlag = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeTriggered]);

  if (!mounted) return null;

  // derived visual values
  // overlay opacity increases with progress but with mild ease
  const overlayOpacity = Math.min(0.95, progress * 1.6);
  // background image scale subtle (zoom out as you scroll)
  const bgScale = 1 + Math.max(0, 0.06 - progress * 0.02); // from 1.06 -> ~1.04
  // marquee speed modifier (we keep CSS animation but multiply via CSS variable)
  const marqueeSpeed = Math.max(0.35, 1 - progress * 0.45); // 1 -> 0.55

  return (
    <section ref={containerRef} className="w-full relative overflow-hidden select-none">
      {/* Global CSS for this section */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes galleryBgMorph {
          0% { background-color: #080808; }
          33% { background-color: #36010a; }
          66% { background-color: #261a03; }
          100% { background-color: #080808; }
        }
        @keyframes marqueeTrack {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .bf-marquee { animation: marqueeTrack var(--marquee-duration, 140s) linear infinite; }
        .prefers-reduced { animation-play-state: paused !important; }
        /* simple fade/slide utilities used below */
        .fade-slide-up { transform: translateY(10px); opacity: 0; transition: transform 620ms cubic-bezier(.16,1,.3,1), opacity 480ms ease; }
        .fade-slide-up.in { transform: translateY(0); opacity: 1; }
      ` }} />

      {/* Background image layer - not sticky, so it won't overlap navbar; transform is local to this section */}
      <div
        aria-hidden
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          zIndex: 0,
          willChange: 'transform',
          transform: `scale(${bgScale})`,
        }}
      >
        <img
          src={encodePath('/Hotel.jpg')}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'contrast(0.95) brightness(0.85)' }}
        />
        <div
          style={{
            backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.55})`,
            mixBlendMode: 'multiply',
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Section content (on top of background) */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        {/* Small eyebrow row with fade reveal */}
        <div className={`inline-block px-3 py-1 rounded-md border ${progress > 0.05 ? 'fade-slide-up in' : 'fade-slide-up'}`} style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ color: GOLD }} className="text-[10px] tracking-widest uppercase font-semibold">The Mayfair Series</span>
        </div>

        {/* Main two-column content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left column - typewriter plate */}
          <div>
            <div className={`bg-white/6 backdrop-blur-md p-5 rounded-md ${progress > 0.08 ? 'fade-slide-up in' : 'fade-slide-up'}`} style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[11px] uppercase tracking-[0.6em] text-neutral-200 font-medium">
                {typedTitle || ' '}
                {typedTitle && typedTitle.length < TITLE_TARGET.length && <span className="inline-block w-1 h-3 bg-white animate-pulse ml-2 align-middle" />}
              </div>
            </div>

            <h2 className={`font-serif text-white uppercase text-3xl lg:text-4xl font-extralight tracking-wide leading-tight mt-6 ${progress > 0.14 ? 'fade-slide-up in' : 'fade-slide-up'}`}>
              The Architecture of Detail.
            </h2>

            <div className={`w-16 h-[1px] bg-[${GOLD}] mt-6 ${progress > 0.14 ? 'fade-slide-up in' : 'fade-slide-up'}`} />

            <p className={`mt-6 text-neutral-300 text-sm leading-relaxed max-w-xl ${progress > 0.18 ? 'fade-slide-up in' : 'fade-slide-up'}`}>
              {typedNarrative || (progress < 0.18 ? '\u00A0' : '')}
              {typedNarrative && typedNarrative.length < NARRATIVE_TARGET.length && <span className="inline-block w-1.5 h-3.5 bg-[#E5C494] animate-pulse ml-1 align-middle" />}
            </p>

            <div className={`mt-6 ${progress > 0.22 ? 'fade-slide-up in' : 'fade-slide-up'}`}>
              <div className="inline-flex items-center gap-3 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3">
                <div className="text-xs uppercase tracking-[0.45em] text-neutral-200 font-light">{typedAmenitiesLabel || (progress < 0.22 ? '\u00A0' : '')}</div>
              </div>
            </div>
          </div>

          {/* Right column - marquee + micro-cards */}
          <div>
            {/* marquee wrapper */}
            <div className="w-full overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div
                className={`flex items-stretch gap-6 py-4 will-change-transform ${prefersReduced ? 'prefers-reduced' : ''}`}
                // CSS var for marquee duration to subtly vary based on progress
                style={{ '--marquee-duration': `${Math.max(100, marqueeSpeed * 140)}s` } as React.CSSProperties}
              >
                <div className={`bf-marquee flex gap-6`} style={{ minWidth: '200%' }}>
                  {infiniteImages.map((it, i) => (
                    <div key={i} className="flex-none w-[40vw] sm:w-[30vw] md:w-[24vw] lg:w-[18vw] aspect-[4/5] overflow-hidden rounded-md">
                      <img src={encodePath(it.src)} alt={it.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* small cards beneath marquee that reveal on scroll */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg bg-white/6 border ${progress > 0.32 ? 'fade-slide-up in' : 'fade-slide-up'}`} style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <h4 className="text-white font-semibold">Signature Suites</h4>
                <p className="text-neutral-300 text-sm mt-2">Expansive suites carved for quiet mornings and cinematic dusk.</p>
              </div>
              <div className={`p-4 rounded-lg bg-white/6 border ${progress > 0.36 ? 'fade-slide-up in' : 'fade-slide-up'}`} style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <h4 className="text-white font-semibold">Culinary Studio</h4>
                <p className="text-neutral-300 text-sm mt-2">Tasting menus that read like architecture — layered and precise.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transition CTA row */}
        <div className={`mt-12 flex items-center gap-6 ${progress > 0.46 ? 'fade-slide-up in' : 'fade-slide-up'}`}>
          <a href="#booking" className="inline-flex items-center gap-3 bg-[linear-gradient(90deg,#6D001A,#8A0022)] px-5 py-3 rounded-xl text-xs font-semibold uppercase shadow-lg">
            Book an Experience
          </a>
          <a href="#gallery" className="text-sm text-neutral-300 underline">Explore the gallery</a>
        </div>
      </div>

      {/* Lower white reflow area (keeps your pipeline look) */}
      <div className="w-full bg-[#FAF9F5] text-black py-24 border-t border-black/[0.04] relative z-10">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <span className="text-[10px] tracking-[0.55em] text-[#6D001A] font-bold uppercase mb-4 block">The Mayfair Collection</span>
          <h3 className="font-serif text-3xl sm:text-4xl uppercase font-light tracking-widest leading-tight text-neutral-900">Uncompromised Lines.</h3>
          <div className="w-16 h-[1px] bg-[#6D001A] my-6 mx-auto" />
          <p className="text-neutral-600 text-sm max-w-xl mx-auto leading-relaxed">The spatial layout adapts back into normal vertical movement blocks. Scroll downward to access reservations and pipelines.</p>
        </div>
      </div>
    </section>
  );
}