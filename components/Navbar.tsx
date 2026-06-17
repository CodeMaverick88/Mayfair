'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Clean navigation links with MEISON completely removed
  const navLinks = [
    { name: 'Home', href: '/home' },
    { name: 'Rooms & Suites', href: '/rooms' },
    { name: 'Dining', href: '/dining' },
    { name: 'Wellness', href: '/wellness' },
    { name: 'Events', href: '/events' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const handleLinkClick = (href: string) => {
    setIsDrawerOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* GLOBAL BACKGROUND GLASS NAVIGATION BAR */}
      <nav
        className={`fixed top-0 inset-x-0 z-40 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-black/20 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] py-3 sm:py-4'
            : 'bg-transparent border-b border-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          
          {/* LEFT AREA: HAMBURGER TRIGGER ONLY */}
          <div className="flex items-center z-10">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 transition-all duration-300 focus:outline-none group"
              aria-label="Open Navigation Drawer"
            >
              <span className="w-5 h-0.5 bg-white transition-all duration-300 group-hover:w-6" />
              <span className="w-4 h-0.5 bg-neutral-300 transition-all duration-300 group-hover:w-6" />
              <span className="w-5 h-0.5 bg-white transition-all duration-300" />
            </button>
          </div>

          {/* CENTER AREA: BRAND SIGNATURE */}
          <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
            <h1 
              className="text-xl sm:text-2xl font-serif font-bold tracking-[0.25em] text-white uppercase select-none drop-shadow-md pointer-events-auto cursor-pointer transition-opacity hover:opacity-80" 
              onClick={() => handleLinkClick('/home')}
            >
              Mayfair
            </h1>
          </div>

          {/* RIGHT AREA: BOOK NOW CTA BUTTON */}
          <div className="z-10">
            <button
              type="button"
              onClick={() => handleLinkClick('/bookings')}
              className="relative px-4 sm:px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-white bg-[#6D001A]/80 hover:bg-[#8A0022] border border-white/10 shadow-[0_4px_20px_rgba(109,0,26,0.2)] hover:shadow-[0_4px_25px_rgba(138,0,34,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none backdrop-blur-md"
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* SLIDE-OUT MOBILE/GLOBAL PREMIUM GLASS DRAWER OVERLAY */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <div 
          className={`absolute top-0 left-0 h-full w-72 sm:w-80 bg-neutral-950/40 backdrop-blur-3xl border-r border-white/[0.08] shadow-[25px_0_50px_-12px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
              <span className="font-serif text-lg font-bold tracking-widest text-neutral-300 uppercase">Navigation</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-all focus:outline-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleLinkClick(link.href)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-xs uppercase tracking-widest font-medium transition-all duration-300 border focus:outline-none ${
                      isActive
                        ? 'bg-[#6D001A]/30 text-white border-[#6D001A] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'bg-white/[0.01] hover:bg-white/[0.05] text-neutral-400 hover:text-white border-transparent'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[10px] text-neutral-500 tracking-wider font-light uppercase text-center">
            Mayfair Luxury Management v1.0
          </div>
        </div>
      </div>
    </>
  );
}