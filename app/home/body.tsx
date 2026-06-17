'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function BodySection() {
  const [mounted, setMounted] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [typedNarrative, setTypedNarrative] = useState('');
  const [typedAmenitiesLabel, setTypedAmenitiesLabel] = useState('');
  const [typewriterTriggered, setTypewriterTriggered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const TITLE_TARGET = "Spatial Concept";
  const NARRATIVE_TARGET = "Mayfair is an architectural masterpiece sanctuary. A flawless convergence of raw structural lines, monolithic geometries, and profound stillness designed completely unbothered by external noise.";
  const AMENITIES_TARGET = "Some of our amenities";

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

  useEffect(() => {
    setMounted(true);

    const handleScrollMetrics = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalScrollableDistance = rect.height - windowHeight;
      const currentScrollProgress = Math.max(0, Math.min(1, -rect.top / (totalScrollableDistance || 1)));
      
      setScrollProgress(currentScrollProgress);

      if (rect.top < windowHeight * 0.8) {
        setTypewriterTriggered(true);
      }
    };

    window.addEventListener('scroll', handleScrollMetrics, { passive: true });
    handleScrollMetrics();
    return () => window.removeEventListener('scroll', handleScrollMetrics);
  }, []);

  // Multi-Tiered Clock Typewriter Sequence
  useEffect(() => {
    if (!typewriterTriggered) return;

    let titleIdx = 0;
    let narrativeIdx = 0;
    let labelIdx = 0;

    setTypedTitle('');
    setTypedNarrative('');
    setTypedAmenitiesLabel('');

    const titleTimer = setInterval(() => {
      if (titleIdx < TITLE_TARGET.length) {
        setTypedTitle((prev) => prev + TITLE_TARGET.charAt(titleIdx));
        titleIdx++;
      } else {
        clearInterval(titleTimer);

        const narrativeTimer = setInterval(() => {
          if (narrativeIdx < NARRATIVE_TARGET.length) {
            setTypedNarrative((prev) => prev + NARRATIVE_TARGET.charAt(narrativeIdx));
            narrativeIdx++;
          } else {
            clearInterval(narrativeTimer);

            const labelTimer = setInterval(() => {
              if (labelIdx < AMENITIES_TARGET.length) {
                setTypedAmenitiesLabel((prev) => prev + AMENITIES_TARGET.charAt(labelIdx));
                labelIdx++;
              } else {
                clearInterval(labelTimer);
              }
            }, 100);
          }
        }, 40);
      }
    }, 70);

    return () => clearInterval(titleTimer);
  }, [typewriterTriggered]);

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full relative flex flex-col p-0 m-0 bg-black border-none outline-none"
    >
      
      {/* Global Style Layer: Visible, Seamless Palette Color Shifts & Smooth Marquee Loops */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dynamicGalleryBgMorph {
          0% { background-color: #080808; }
          33% { background-color: #36010a; } /* Rich Velvet Burgundy Aura */
          66% { background-color: #261a03; } /* Premium Warm Burnished Amber/Gold Aura */
          100% { background-color: #080808; }
        }
        @keyframes horizontalMarqueeTrack {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-gallery-bg-color-morph {
          animation: dynamicGalleryBgMorph 14s ease-in-out infinite;
        }
        .animate-marquee-slow-crawl {
          animation: horizontalMarqueeTrack 130s linear infinite;
        }
      `}} />

      {/* ── STAGE 1: TRUE CONCISE STICKY SCROLL BASE (Height tightly compressed) ── */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          
          {/* Frozen Architecture Grid Viewport Background */}
          <img 
            src="/Hotel.jpg" 
            alt="Mayfair Design Grid" 
            className="w-full h-full object-cover"
          />

          {/* Precision Scroll-Activated Darkness Overlay Curtain */}
          <div 
            style={{ 
              opacity: Math.min(1, scrollProgress * 2.5),
              backgroundColor: `rgba(0, 0, 0, ${Math.min(0.95, scrollProgress * 2.0)})` 
            }}
            className="absolute inset-0 z-10 transition-all duration-150 ease-out" 
          />
          <div className="absolute inset-0 bg-black/20 z-0" />
        </div>
      </div>

      {/* ── STAGE 2: CONDENSED FOREGROUND CONTENT BLOCK (No boring vertical gaps) ── */}
      <div className="relative z-20 w-full flex flex-col items-start max-w-5xl mx-auto px-6 sm:px-12 md:px-16">
        
        {/* Tightly tailored, ultra-shortened description area */}
        <div className="w-full pt-20 pb-4 flex flex-col items-start justify-center">
          
          {/* GLOWING GLASS UI ENCASED TITLE PLATE */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 px-5 py-2.5 rounded-sm mb-6 shadow-[0_0_15px_rgba(255,255,255,0.01)] hover:shadow-[0_0_25px_rgba(229,196,148,0.35)] hover:border-[#E5C494]/40 transition-all duration-500 ease-out group cursor-default">
            <span className="text-[10px] sm:text-xs tracking-[0.60em] text-white group-hover:text-[#E5C494] font-medium uppercase block transition-colors duration-300">
              {typedTitle}
              {typedTitle.length > 0 && typedTitle.length < TITLE_TARGET.length && (
                <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse" />
              )}
            </span>
          </div>

          <h2 className="font-serif text-white uppercase text-2xl sm:text-3xl md:text-4xl font-extralight tracking-widest leading-tight mb-6 max-w-xl">
            The Architecture of Detail.
          </h2>
          <div className="w-16 h-[1px] bg-[#E5C494]/40 mb-6" />
          
          {/* Shortened, clear description container */}
          <p className="font-sans text-neutral-300 text-xs sm:text-sm md:text-base tracking-widest font-light leading-relaxed max-w-2xl min-h-[5rem] md:min-h-[4rem]">
            {typedNarrative}
            {typedNarrative.length > 0 && typedNarrative.length < NARRATIVE_TARGET.length && (
              <span className="inline-block w-1.5 h-3.5 bg-[#E5C494] animate-pulse ml-1 align-middle" />
            )}
          </p>
        </div>

        {/* Compressed action box layout lane */}
        <div className="w-full pt-4 pb-16 flex items-center justify-start">
          {/* GLOWING GLASS UI BOX CONTAINER */}
          <div className="border border-white/10 bg-black/40 backdrop-blur-lg px-7 py-3.5 flex items-center justify-center min-h-[3rem] shadow-[0_0_15px_rgba(255,255,255,0.01)] hover:shadow-[0_0_30px_rgba(229,196,148,0.4)] hover:border-[#E5C494]/50 transition-all duration-500 ease-out group cursor-default">
            <p className="font-serif text-neutral-200 group-hover:text-[#E5C494] uppercase text-xs sm:text-sm tracking-[0.45em] font-light transition-colors duration-300">
              {typedAmenitiesLabel}
              {typedAmenitiesLabel.length > 0 && typedAmenitiesLabel.length < AMENITIES_TARGET.length && (
                <span className="inline-block w-1.5 h-3 bg-[#E5C494] animate-pulse ml-1 align-baseline" />
              )}
            </p>
          </div>
        </div>

      </div>

      {/* ── STAGE 3: HORIZONTAL GALLERY WITH HIGH-VISIBILITY COLOR MORPH CANVAS ── */}
      {/* py-24 provides explicit canvas visibility to frame the smooth, rich background color shift */}
      <section className="w-full relative animate-gallery-bg-color-morph py-24 z-30 flex flex-col justify-center m-0 border-none outline-none transition-colors duration-1000 ease-in-out">
        
        {/* Soft atmospheric mixed lamp light tracking overhead */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-full bg-[radial-gradient(circle_at_top,rgba(229,196,148,0.04)_0%,transparent_70%)] pointer-events-none z-10 select-none mix-blend-screen" />

        {/* Seamless Infinite Image Marquee Runway Layout */}
        <div className="w-full overflow-hidden relative py-2 flex items-center m-0 p-0">
          <div className="flex items-center gap-6 sm:gap-8 pr-8 animate-marquee-slow-crawl whitespace-nowrap will-change-transform">
            {infiniteImages.map((item, idx) => (
              <div
                key={`${idx}`}
                className="inline-block flex-none w-[72vw] sm:w-[50vw] md:w-[36vw] lg:w-[25vw] aspect-[4/5] overflow-hidden relative m-0 p-0 group"
              >
                {/* Image asset component */}
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                  loading="lazy"
                />

                {/* GLOWING GLASS UI FRAME TITLE CAPSLOCK TAG */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none">
                  <div className="backdrop-blur-lg bg-black/40 border border-white/10 group-hover:border-[#E5C494]/60 px-3 py-1.5 rounded-xs flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_20px_rgba(229,196,148,0.35)] transition-all duration-500 ease-out">
                    <span className="font-serif text-[9px] tracking-widest uppercase text-neutral-300 group-hover:text-white font-light transition-colors duration-300">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── STAGE 4: HIGH-CONTRAST VERTICAL RE-FLOW PIPELINE SYSTEM ── */}
      <section className="w-full bg-[#FAF9F5] text-black py-28 relative z-40 border-t border-black/[0.04] p-0 m-0">
        <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
          <span className="text-[10px] tracking-[0.55em] text-[#6D001A] font-bold uppercase mb-6">
            The Mayfair Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl uppercase font-light tracking-widest leading-tight text-neutral-900">
            Uncompromised Lines.
          </h2>
          <div className="w-16 h-[1px] bg-[#6D001A] my-8" />
          <p className="text-neutral-500 font-light text-xs sm:text-sm tracking-widest max-w-xl leading-loose">
            The spatial layout adapts back into normal vertical movement blocks. Scroll downward to access customized reservations and pipelines.
          </p>
        </div>
      </section>

    </div>
  );
}