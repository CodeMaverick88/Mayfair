'use client';

import React from 'react';
import { Mail, Phone, MessageCircle, Globe, Users } from 'lucide-react';

/**
 * MAYFAIR FOOTER COMPONENT
 * Aesthetic: Deep Charcoal #0A0A0A base with #6D001A accenting.
 * Fix: Used widely-supported Lucide icons to avoid TS export errors.
 */

export default function Footer() {
  // Using Globe and Users as high-quality fallbacks that are definitely in your Lucide version
  const socialLinks = [
    { icon: <Globe size={18} />, label: "Instagram", href: "#" },
    { icon: <Users size={18} />, label: "Facebook", href: "#" },
    { icon: <MessageCircle size={18} />, label: "WhatsApp", href: "https://wa.me/0712345678", value: "0712345678" },
  ];

  const contactInfo = [
    { icon: <Mail size={18} />, label: "Email", value: "mayfairhotels@gmail.com", href: "mailto:mayfairhotels@gmail.com" },
    { icon: <Phone size={18} />, label: "Direct Line", value: "0787654321", href: "tel:0787654321" },
  ];

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        
        {/* ── HORIZONTAL MAIN CONTENT ── */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12 mb-20">
          
          {/* SECTION 1: BRANDING & SOCIALS */}
          <div className="flex-1 flex flex-col justify-between border-l border-[#6D001A] pl-8 py-2">
            <div>
              <h2 className="font-serif text-white text-4xl uppercase tracking-[0.2em] mb-4">Mayfair</h2>
              <p className="text-neutral-500 text-[10px] tracking-[0.4em] uppercase mb-8">Architectural Excellence & Luxury</p>
            </div>
            
            <div className="flex gap-6">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href}
                  title={social.label}
                  className="text-neutral-400 hover:text-[#6D001A] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="p-2 border border-white/5 rounded-full group-hover:border-[#6D001A]/50 transition-colors">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* SECTION 2: CONTACT DETAILS (Horizontal Flow) */}
          <div className="flex-[1.5] flex flex-col md:flex-row gap-8 md:gap-16 border-l border-white/5 pl-8 py-2">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <span className="text-[#6D001A] text-[10px] tracking-[0.3em] uppercase font-bold">{info.label}</span>
                <a href={info.href} className="text-white font-serif text-lg hover:text-neutral-400 transition-colors">
                  {info.value}
                </a>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <span className="text-[#6D001A] text-[10px] tracking-[0.3em] uppercase font-bold">Location</span>
              <p className="text-white font-serif text-lg leading-tight">
                Mayfair District,<br />London, W1J
              </p>
            </div>
          </div>

          {/* SECTION 3: LIVE MAP INTEGRATION */}
          <div className="flex-[2] h-[300px] lg:h-auto min-h-[250px] relative rounded-sm overflow-hidden border border-white/5 group">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.246241774218!2d-0.1465228!3d51.5086111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876052989182307%3A0x67586e373468574a!2sMayfair%2C%20London!5e0!3m2!1sen!2suk!4v1718712345678!5m2!1sen!2suk"
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 pointer-events-none border border-white/10" />
          </div>

        </div>

        {/* ── BOTTOM STRIP ── */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
          <p className="text-neutral-600 text-[9px] tracking-[0.5em] uppercase">
            © 2026 Mayfair Architectural Systems. All Rights Reserved.
          </p>
          <div className="flex gap-12">
            <a href="#" className="text-neutral-600 hover:text-white text-[9px] tracking-[0.5em] uppercase transition-colors">Privacy Policy</a>
            <a href="#" className="text-neutral-600 hover:text-white text-[9px] tracking-[0.5em] uppercase transition-colors">Terms of Service</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
