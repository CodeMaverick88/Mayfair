'use client';
import React from 'react';
import Link from 'next/link';

export default function ContactCard() {
  const base: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    background: 'rgba(255,255,255,0.02)',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  };

  const hoverStyle: React.CSSProperties = {
    borderColor: 'rgba(229,196,148,0.12)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
    transform: 'translateY(-4px)',
    transition: 'all 240ms ease',
  };

  return (
    <div
      role="region"
      aria-label="Contact card"
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = String(hoverStyle.borderColor);
        el.style.boxShadow = String(hoverStyle.boxShadow);
        el.style.transform = String(hoverStyle.transform);
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = base.borderColor!;
        el.style.boxShadow = '';
        el.style.transform = '';
      }}
      style={base}
    >
      <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 8a9 9 0 0118 0v6a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" stroke="white" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Front Desk</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
          Available 24/7 • <Link href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>Contact us</Link>
        </div>
      </div>

      <div>
        <Link href="/rooms" style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: '#fff', textDecoration: 'none', display: 'inline-block' }}>
          View rooms
        </Link>
      </div>
    </div>
  );
}