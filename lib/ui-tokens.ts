// lib/ui-tokens.ts
export const TOKENS = {
  crimson: '#6D001A',
  deep: '#3A0353',
  gold: '#E5C494',
  gold2: '#F59E51',
  purple: '#804A8A',
  bg: '#070308',
  text: '#FFFFFF',
  ease: 'cubic-bezier(.16,1,.3,1)',
};

export function formatKsh(amount: number | string) {
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, '')) || 0;
  return `Ksh ${n.toLocaleString('en-KE')}`;
}