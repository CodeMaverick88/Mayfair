'use client';

import React from 'react';
import HeroSection from './HeroSection';
import BodySection from './body'; // Imports body.tsx from your home folder
import ExperiencesSection from './experiences'; // Imports your new experience suite component

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  MAYFAIR — CORE HOME CONNECTOR PIPELINE                      ║
  ║  1. Pins HeroSection for initial viewport compression.       ║
  ║  2. Hands over scroll track control seamlessly to the Body.  ║
  ║  3. Opens immersive interactive paths inside Experiences.   ║
  ╚══════════════════════════════════════════════════════════════╝
*/

export default function HomePage() {
  return (
    <main className="relative w-full min-h-screen bg-black overflow-x-hidden flex flex-col">
      
      {/* STAGE 1: CINEMATIC HERO SEQUENCE */}
      <HeroSection />

      {/* STAGE 2: ARCHITECTURAL DESCRIPTION & HORIZONTAL CONTINUUM */}
      {/* <div className="relative z-30 w-full bg-black">
        <BodySection />
      </div> */}

      {/* STAGE 3: INTERACTIVE EXPANSION & CURATED EXPERIENCE SUITE */}
      {/* Changed bg-[#FAF9F5] to bg-black to ensure seamless transition to the dark footer */}
      <div className="relative z-40 w-full bg-black">
        <ExperiencesSection />
      </div>

      {/* Note: The Footer is placed in layout.tsx to be global. 
          If you want it ONLY on the home page, you can move it here 
          from layout.tsx.
      */}

    </main>
  );
}