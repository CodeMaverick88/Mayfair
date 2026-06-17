'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      
      {/* Main Navigation Bar */}
      <nav className="w-full border-b border-zinc-800 px-8 py-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="font-serif font-bold text-xl tracking-widest">
            MAYFAIR
          </div>
          <div className="flex gap-6 text-sm tracking-wide">
            {/* The MEISON button serves as the active home indicator */}
            <Link 
              href="/home" 
              className="text-amber-500 font-bold border-b-2 border-amber-500 pb-1"
            >
              MEISON
            </Link>
            <Link href="/amenities" className="text-zinc-400 hover:text-white pb-1 transition-colors">
              Amenities
            </Link>
            <Link href="/suites" className="text-zinc-400 hover:text-white pb-1 transition-colors">
              Suites/Rooms
            </Link>
            <Link href="/about" className="text-zinc-400 hover:text-white pb-1 transition-colors">
              About Us
            </Link>
            <Link href="/location" className="text-zinc-400 hover:text-white pb-1 transition-colors">
              Location
            </Link>
          </div>
        </div>
        
        <Link 
          href="/" 
          className="bg-red-950/30 border border-red-900/50 text-red-400 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-900 hover:text-white transition-all"
        >
          Logout
        </Link>
      </nav>

      {/* Primary Dashboard Content */}
      <main className="max-w-7xl mx-auto p-10 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <h1 className="text-4xl font-serif font-bold mb-4 text-white relative z-10">
            System Initialization Successful
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl relative z-10 leading-relaxed">
            Welcome to the operational dashboard. This page now contains the necessary structural content to ensure your Vercel pipeline compiles and deploys correctly without throwing an empty page error.
          </p>
        </div>
      </main>
      
    </div>
  );
}