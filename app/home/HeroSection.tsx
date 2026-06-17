'use client';

import React, { useState, useEffect, useRef } from 'react';

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  MAYFAIR — VELOCITY HERO WITH VISIBLE ETCHED BACKGROUND TEXT ║
  ║  1. Swapped watermarks to high-contrast premium low-opacity.  ║
  ║  2. Retained full hardware-accelerated physics calculations.║
  ╚══════════════════════════════════════════════════════════════╝
*/

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  
  // Consolidating animation metrics to prevent independent thrashed renders
  const [frameMetrics, setFrameMetrics] = useState({
    progress: 0,
    velocity: 0,
    isPast: false
  });

  // Isolated Text States
  const [videoText, setVideoText] = useState('');
  const [leftLine1, setLeftLine1] = useState('');
  const [leftLine2, setLeftLine2] = useState('');
  const [leftLine3, setLeftLine3] = useState('');
  const [leftTypingStarted, setLeftTypingStarted] = useState(false);

  const VIDEO_MESSAGE = "Welcome to Mayfair. Experience a refined sanctuary of pure luxury.";
  const L1_TARGET = "IMMERSE";
  const L2_TARGET = "YOURSELF IN";
  const L3_TARGET = "MAYFAIR";

  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const leftTypewriterId = useRef<NodeJS.Timeout | null>(null);

  const ANIMATION_DISTANCE = 1100;

  // ── HARDWARE ACCELERATED FRAME SYNCHRONIZATION LOOP ──
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      targetScroll.current = window.scrollY;
    };

    let rafId: number;
    const updatePhysicsLoop = () => {
      const friction = 0.06; 
      currentScroll.current += (targetScroll.current - currentScroll.current) * friction;

      const rawVelocity = targetScroll.current - currentScroll.current;
      const progressCalculated = Math.min(1, Math.max(0, currentScroll.current / ANIMATION_DISTANCE));

      setFrameMetrics({
        progress: progressCalculated,
        velocity: rawVelocity,
        isPast: targetScroll.current > ANIMATION_DISTANCE
      });

      rafId = requestAnimationFrame(updatePhysicsLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(updatePhysicsLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── CINEMATIC TYPEWRITER ENGINE 1: SCREEN OVERLAY ──
  useEffect(() => {
    if (!mounted) return;
    let index = 0;
    setVideoText('');
    const interval = setInterval(() => {
      if (index < VIDEO_MESSAGE.length) {
        setVideoText((prev) => prev + VIDEO_MESSAGE.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 210);
    return () => clearInterval(interval);
  }, [mounted]);

  // ── CINEMATIC TYPEWRITER ENGINE 2: LEFT PANEL STATEMENT ──
  useEffect(() => {
    if (frameMetrics.progress > 0.12 && !leftTypingStarted) {
      setLeftTypingStarted(true);
      
      let charIdx = 0;
      let currentLine = 1;

      const runSlowTypewriter = () => {
        if (currentLine === 1) {
          if (charIdx < L1_TARGET.length) {
            setLeftLine1(L1_TARGET.slice(0, charIdx + 1));
            charIdx++;
            leftTypewriterId.current = setTimeout(runSlowTypewriter, 190);
          } else {
            currentLine = 2;
            charIdx = 0;
            leftTypewriterId.current = setTimeout(runSlowTypewriter, 300);
          }
        } else if (currentLine === 2) {
          if (charIdx < L2_TARGET.length) {
            setLeftLine2(L2_TARGET.slice(0, charIdx + 1));
            charIdx++;
            leftTypewriterId.current = setTimeout(runSlowTypewriter, 160);
          } else {
            currentLine = 3;
            charIdx = 0;
            leftTypewriterId.current = setTimeout(runSlowTypewriter, 300);
          }
        } else if (currentLine === 3) {
          if (charIdx < L3_TARGET.length) {
            setLeftLine3(L3_TARGET.slice(0, charIdx + 1));
            charIdx++;
            leftTypewriterId.current = setTimeout(runSlowTypewriter, 200);
          }
        }
      };

      runSlowTypewriter();
    } 
    else if (frameMetrics.progress < 0.03 && leftTypingStarted) {
      if (leftTypewriterId.current) clearTimeout(leftTypewriterId.current);
      setLeftLine1('');
      setLeftLine2('');
      setLeftLine3('');
      setLeftTypingStarted(false);
    }
  }, [frameMetrics.progress, leftTypingStarted]);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  const p = frameMetrics.progress;
  const videoWidth = 100 - (p * 52);   
  const videoHeight = 100 - (p * 70);  
  const videoTop = p * 35;             
  const videoLeft = p * 46;            

  const videoOverlayOpacity = Math.max(0, 1 - p * 4.5);
  const leftTextOpacity = Math.min(1, Math.max(0, (p - 0.10) / 0.65));

  const textDynamicPullY = frameMetrics.velocity * 0.08; 
  const textDynamicBounceScale = 1 + Math.min(0.03, Math.abs(frameMetrics.velocity) * 0.00025);

  return (
    <div 
      className="relative bg-white text-black w-full" 
      style={{ height: `calc(100vh + ${ANIMATION_DISTANCE}px)` }}
    >
      <div
        style={{
          position: frameMetrics.isPast ? 'absolute' : 'fixed',
          top: frameMetrics.isPast ? `${ANIMATION_DISTANCE}px` : '0px',
          left: 0,
          width: '100%',
          height: '100vh',
        }}
        className="overflow-hidden bg-white z-20"
      >
        
        {/* ── CINEMATIC AMBIENT BACKGROUND TEXT (FIXED ETCHED CONTRAST VALUE) ── */}
        <div
          style={{
            opacity: leftTextOpacity * 1, 
            transform: `translateY(${textDynamicPullY * 0.4}px) scale(${1 + Math.min(0.015, Math.abs(frameMetrics.velocity) * 0.00015)})`,
            transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.5s ease-out',
          }}
          className="absolute left-[4%] top-[18vh] text-[18vw] font-serif font-black text-black/[0.03] tracking-widest leading-none select-none pointer-events-none z-0 uppercase"
        >
          Immerse
        </div>
        
        {/* ── LEFT GRID LAYOUT BLOCK ── */}
        <div
          style={{
            opacity: leftTextOpacity,
            transform: `translateY(${textDynamicPullY}px) scale(${textDynamicBounceScale})`,
            transformOrigin: 'left center',
            transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.4s ease-out',
          }}
          className="absolute left-[6%] sm:left-[8%] top-[35vh] min-h-[30vh] w-[34%] flex flex-col justify-center pointer-events-none select-none z-10"
        >
          <span className="text-[10px] tracking-[0.6em] text-[#6D001A] font-bold uppercase mb-4 block">
            The Mayfair Collection
          </span>
          
          <h2 
            className="font-serif uppercase leading-[1.08] text-black tracking-wide"
            style={{ 
              fontSize: 'clamp(2.2rem, 3.8vw, 5.5rem)',
              fontWeight: 200
            }}
          >
            {leftLine1}{leftLine1.length > 0 && leftLine1.length < L1_TARGET.length && <span className="text-[#6D001A] animate-pulse ml-0.5">|</span>}
            <br />
            {leftLine2}{leftLine2.length > 0 && leftLine2.length < L2_TARGET.length && <span className="text-[#6D001A] animate-pulse ml-0.5">|</span>}
            <br />
            {leftLine3}{leftLine3.length > 0 && leftLine3.length < L3_TARGET.length && <span className="inline-block w-4 h-[3px] bg-[#6D001A] animate-bounce ml-1" />}
          </h2>

          <div className="w-14 h-[1px] bg-black/40 my-6" />

          <p className="text-[11px] sm:text-xs text-neutral-400 font-normal tracking-[0.18em] leading-relaxed max-w-sm">
            Curated architectural layers perfectly adapted to give lifestyle geometry a beautiful aesthetic direction.
          </p>
        </div>

        {/* ── RIGHT GRID LAYOUT BLOCK: LANDSCAPE VIDEO VIEWPORT ── */}
        <div
          style={{
            position: 'absolute',
            width: `${frameMetrics.isPast ? 48 : videoWidth}vw`,
            height: `${frameMetrics.isPast ? 30 : videoHeight}vh`,
            top: `${frameMetrics.isPast ? 35 : videoTop}vh`,
            left: `${frameMetrics.isPast ? 46 : videoLeft}vw`,
            transform: `translateY(${textDynamicPullY * 0.35}px)`,
            willChange: 'width, height, top, left, transform',
            transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)',
          }}
          className="shadow-[0_50px_100px_rgba(0,0,0,0.05)] bg-black overflow-hidden z-20"
        >
          <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

          <div
            style={{ opacity: videoOverlayOpacity }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none select-none transition-opacity duration-300"
          >
            <span className="text-[10px] text-[#E5C494] font-bold tracking-[0.5em] uppercase mb-4 drop-shadow-sm">
              Exclusive Sanctuary
            </span>
            <h1 className="font-serif text-white uppercase font-bold text-xl sm:text-2xl md:text-3xl tracking-[0.24em] leading-snug max-w-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              {videoText.split('.')[0]}.
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm tracking-[0.18em] font-normal text-neutral-200 mt-3 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {videoText.includes('.') ? videoText.substring(videoText.indexOf('.') + 1).trim() : ''}
              <span className="inline-block w-[1.5px] h-3.5 ml-1.5 bg-[#6D001A] animate-pulse align-middle" />
            </p>

            <div className="mt-14 flex flex-col items-center gap-1 opacity-40 animate-bounce">
              <span className="text-[9px] text-white uppercase tracking-[0.35em]">Scroll Down</span>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

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
  );
}