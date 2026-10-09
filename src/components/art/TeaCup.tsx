import { useId } from 'react';

/**
 * মাটির ভাঁড় — the clay cup that every Kolkata adda is poured into. Three
 * steam ribbons rise and fade on a loop; the tea surface can be clipped by
 * the parent (see ScrollCup) to show a fill level.
 */
export function TeaCup({ className = '', steam = true, fill = 1 }: { className?: string; steam?: boolean; fill?: number }) {
  const clipId = `tea-${useId().replace(/:/g, '')}`;
  const level = Math.max(0, Math.min(1, fill));
  // Tea sits between y=58 (full) and y=96 (empty) inside the cup walls.
  const teaTop = 96 - 38 * level;
  return (
    <svg className={`tea-cup ${className}`} viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {steam && (
        <g className="tea-steam" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path className="steam steam-1" d="M44 48C38 40 50 34 44 24C40 17 46 12 44 6"/>
          <path className="steam steam-2" d="M60 46C54 37 66 31 60 20C56 13 62 8 60 2"/>
          <path className="steam steam-3" d="M76 48C70 40 82 34 76 24C72 17 78 12 76 6"/>
        </g>
      )}
      {/* cup body */}
      <path className="cup-body" d="M22 56C22 52 26 50 30 50H90C94 50 98 52 98 56L92 110C91 116 86 120 80 120H40C34 120 29 116 28 110L22 56Z" fill="var(--terracotta)" stroke="var(--darkterr)" strokeWidth="2"/>
      <path d="M30 66H90M32 80H88M35 94H85" stroke="var(--darkterr)" strokeWidth="1.2" opacity=".55"/>
      {/* tea surface, clipped to the fill level */}
      <clipPath id={clipId}><rect x="22" y={teaTop} width="76" height={130 - teaTop}/></clipPath>
      <g clipPath={`url(#${clipId})`}>
        <path d="M24 56H96L92 110C91 116 86 120 80 120H40C34 120 29 116 28 110L24 56Z" fill="#c98a4b"/>
        <ellipse className="tea-surface" cx="60" cy={teaTop + 2} rx="36" ry="6" fill="#e0a862"/>
      </g>
      {/* rim */}
      <ellipse cx="60" cy="52" rx="38" ry="8" fill="var(--terracotta)" stroke="var(--darkterr)" strokeWidth="2"/>
      <ellipse cx="60" cy="52" rx="32" ry="5.5" fill={level > 0.9 ? '#e0a862' : '#8c3c2a'} opacity={level > 0.9 ? 1 : .55}/>
      {/* saucer shadow */}
      <ellipse cx="60" cy="124" rx="34" ry="4" fill="var(--darkterr)" opacity=".18"/>
    </svg>
  );
}
