'use client';

import React, { useState, useEffect } from 'react';

/**
 * EXPERIENCES SECTION: COLLAGE-STYLE INTERACTIVE GRID
 * Aesthetic: Deep Charcoal #0A0A0A base with #6D001A accenting.
 * Fixes: 
 * 1. URL encodes image paths to handle spaces (e.g., "Spa 1.jpeg" -> "Spa%201.jpeg").
 * 2. Synchronizes hover information with image appearance.
 * 3. Ensures only defined sections are rendered.
 */

interface PathItem {
  id: number;
  tag: string;
  title: string;
  desc: string;
  img: string;
  side: 'left' | 'right';
}

export default function ExperiencesSection() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Note: Filenames with spaces MUST be handled carefully in CSS/HTML.
  // I have kept your exact filenames but added a helper to encode them.
  const explorationPaths: PathItem[] = [
    { id: 0, tag: "Sanctuary", title: "Private Residences", desc: "Monolithic, high-ceiling duplexes crafted for stillness.", img: "/Lobby.jpg", side: "left" },
    { id: 1, tag: "Wellness", title: "Thermal Spa Vault", desc: "Immersive soundless hydro-therapy spaces.", img: "/Spa 1.jpeg", side: "right" },
    { id: 2, tag: "Fitness", title: "The Kinetic Lab", desc: "Advanced structural training and fitness modules.", img: "/Gym 5.jpeg", side: "left" },
    { id: 3, tag: "Aquatic", title: "Hydro Sanctuary", desc: "Temperature-controlled precision water environments.", img: "/Aquirium.jpeg", side: "right" },
    { id: 4, tag: "Business", title: "Conference Chambers", desc: "Bespoke boardrooms for private architectural discourse.", img: "/Conference Room.jpeg", side: "left" },
    { id: 5, tag: "Leisure", title: "Games & Football Arena", desc: "High-performance sports infrastructure.", img: "/Football.jpeg", side: "right" },
    { id: 6, tag: "Mobility", title: "Private Transit", desc: "Seamless chauffeur-driven transit logistics.", img: "/Hotel.jpg", side: "left" },
    { id: 7, tag: "Gastronomy", title: "Culinary Studio", desc: "Restricted sensory dining chambers.", img: "/Food.jpeg", side: "right" }
  ];

  // Helper to safely encode image URLs (handles spaces and special characters)
  const encodeImagePath = (path: string) => {
    return encodeURI(path);
  };

  const getPosition = (idx: number) => {
    const positions = [
      "lg:top-[5%] lg:left-[5%]", "lg:top-[5%] lg:right-[5%]",
      "lg:top-[25%] lg:left-[10%]", "lg:top-[25%] lg:right-[10%]",
      "lg:top-[45%] lg:left-[5%]", "lg:top-[45%] lg:right-[5%]",
      "lg:top-[65%] lg:left-[10%]", "lg:top-[65%] lg:right-[10%]"
    ];
    return positions[idx % positions.length];
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full relative min-h-screen bg-[#0A0A0A] py-24 px-6 overflow-hidden z-40">
      
      {/* ── COLLAGE IMAGE PREVIEW LAYER ── */}
      {explorationPaths.map((path, idx) => (
        <div
          key={`preview-${path.id}`}
          className={`hidden lg:block fixed top-[10vh] ${
            path.side === 'left' ? 'left-10' : 'right-10'
          } w-[35vw] h-[80vh] z-10 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            hoveredIdx === idx ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {/* Image with background fallback to check if it exists */}
          <div 
            className="w-full h-full bg-cover bg-center rounded-sm shadow-2xl brightness-75 border border-white/10 bg-neutral-900" 
            style={{ backgroundImage: `url("${encodeImagePath(path.img)}")` }} 
          />
          
          {/* Text reveal on image */}
          <div className={`absolute bottom-12 ${path.side === 'left' ? 'left-12' : 'right-12'} text-white transition-all duration-700 delay-300 ${hoveredIdx === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             <p className="text-[10px] tracking-[0.5em] uppercase text-[#6D001A] font-bold mb-2">{path.tag}</p>
             <h2 className="text-4xl font-serif uppercase tracking-tighter">{path.title}</h2>
          </div>
        </div>
      ))}

      {/* ── SECTION HEADER ── */}
      <div className="relative z-30 max-w-7xl mx-auto mb-16">
        <h3 className="font-serif text-white text-5xl uppercase font-light tracking-widest mb-6">
          Experiences
        </h3>
        <div className="w-20 h-[1px] bg-[#6D001A]" />
      </div>

      {/* ── INTERACTIVE SCATTERED GRID CONTAINER ── */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[140vh]">
        {explorationPaths.map((path, idx) => (
          <div
            key={path.id}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`lg:absolute w-full lg:w-[40vw] transition-all duration-700 ease-out ${getPosition(idx)} ${
              hoveredIdx !== null && hoveredIdx !== idx ? 'opacity-10 blur-md scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* CARD GLASS UI CONTAINER */}
            <div className={`p-10 backdrop-blur-md transition-all duration-500 rounded-sm group cursor-pointer border ${
              hoveredIdx === idx ? 'bg-white/[0.08] border-white/20' : 'bg-white/[0.02] border-white/5'
            }`}>
              
              <span className="text-[10px] tracking-[0.4em] text-[#6D001A] uppercase font-bold block mb-4">
                {path.tag}
              </span>
              
              <h4 className="font-serif text-white text-2xl uppercase mb-4 tracking-wider">
                {path.title}
              </h4>
              
              {/* DESCRIPTION: Only reveals on hover */}
              <div className={`transition-all duration-700 ease-in-out overflow-hidden ${
                hoveredIdx === idx ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}>
                <p className="text-neutral-400 text-sm tracking-widest font-light mb-8 leading-relaxed">
                  {path.desc}
                </p>
                
                <a 
                  href="#book-now" 
                  className="inline-block border border-[#6D001A] px-10 py-4 text-[#6D001A] text-[10px] tracking-[0.3em] uppercase hover:bg-[#6D001A] hover:text-white transition-all duration-300"
                >
                  Explore Details
                </a>
              </div>
              
              <div className={`absolute top-0 left-0 w-[2px] h-full bg-[#6D001A] transition-all duration-700 ${
                hoveredIdx === idx ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-48" />
    </div>
  );
}
