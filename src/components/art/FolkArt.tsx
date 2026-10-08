import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Motif = 'fish' | 'lotus' | 'sun' | 'vine';

const petals = [0, 45, 90, 135, 180, 225, 270, 315];

export function FolkArt({ kind = 'lotus', className = '' }: { kind?: Motif; className?: string }) {
  const reduced = useReducedMotion();
  const motionProps = reduced
    ? {}
    : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };

  if (kind === 'fish') return (
    <motion.svg {...motionProps} className={`folk-art folk-fish ${className}`} viewBox="0 0 260 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M34 75C69 20 165 20 211 75C165 130 69 130 34 75Z" fill="var(--paper)" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M211 75L251 35V115L211 75Z" fill="var(--mustard)" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M75 39Q59 75 75 111M75 75H208M93 47L114 75L93 103M119 40L144 75L119 110M149 42L174 75L149 108M177 49L198 75L177 101" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M92 75Q104 60 116 75Q128 60 140 75Q152 60 164 75Q176 60 188 75M92 75Q104 90 116 75Q128 90 140 75Q152 90 164 75Q176 90 188 75" stroke="currentColor" strokeWidth="1" opacity=".7"/>
      <circle cx="65" cy="68" r="4.5" fill="currentColor"/>
      <circle cx="65" cy="68" r="9" stroke="currentColor" strokeWidth="1"/>
      <path d="M38 89Q52 100 68 94M12 42Q25 33 38 42M10 108Q25 118 40 108" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M217 70L241 48M217 80L241 102M236 58L249 43M236 91L249 106" stroke="currentColor" strokeWidth="1"/>
      {[102, 130, 160, 187].map(x => <circle key={x} cx={x} cy="75" r="3" fill="var(--terracotta)"/>)}
      <path d="M40 14H218M40 136H218" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7"/>
    </motion.svg>
  );

  if (kind === 'sun') return (
    <motion.svg {...motionProps} className={`folk-art folk-sun ${className}`} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="80" cy="80" r="49" fill="var(--mustard)" stroke="currentColor" strokeWidth="2"/>
      <circle cx="80" cy="80" r="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5"/>
      {Array.from({ length: 16 }, (_, index) => <path key={index} d="M80 8V23" stroke="currentColor" strokeWidth="2" transform={`rotate(${index * 22.5} 80 80)`}/>)}
      <path d="M55 85Q80 59 105 85M58 93Q80 110 102 93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="65" cy="75" r="2" fill="currentColor"/><circle cx="95" cy="75" r="2" fill="currentColor"/>
    </motion.svg>
  );

  if (kind === 'vine') return (
    <motion.svg {...motionProps} className={`folk-art folk-vine ${className}`} viewBox="0 0 180 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M88 280C53 224 127 204 92 150C64 107 119 82 88 0" stroke="currentColor" strokeWidth="2"/>
      {[34, 83, 132, 181, 232].map((y, index) => <g key={y} transform={`translate(${index % 2 ? 88 : 92} ${y}) rotate(${index % 2 ? 28 : -28})`}><path d="M0 0C20-32 60-33 67-3C38 13 15 15 0 0Z" fill="var(--paper)" stroke="currentColor" strokeWidth="2"/><path d="M0 0L56-3M23-3L33-15M34-2L46 8" stroke="currentColor" strokeWidth="1"/></g>)}
      <circle cx="88" cy="17" r="5" fill="var(--terracotta)"/>
    </motion.svg>
  );

  return (
    <motion.svg {...motionProps} className={`folk-art folk-lotus ${className}`} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="86" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 7"/>
      {petals.map(angle => <g key={angle} transform={`rotate(${angle} 100 100)`}><path d="M100 100C77 76 83 48 100 29C117 48 123 76 100 100Z" fill="var(--paper)" stroke="currentColor" strokeWidth="2"/><path d="M100 88V43M93 70L100 78L107 70" stroke="currentColor" strokeWidth="1.4"/></g>)}
      <circle cx="100" cy="100" r="20" fill="var(--mustard)" stroke="currentColor" strokeWidth="2"/>
      <circle cx="100" cy="100" r="11" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="100" cy="100" r="3" fill="currentColor"/>
    </motion.svg>
  );
}

/**
 * কাঁথা — the running stitch of Bengal's quilts. Three stitched rows: two straight
 * runs that travel in opposite directions and a wave between them. The wave is
 * generated so it can be long enough to cover any container width.
 */
const wave = (() => {
  let d = 'M0 12';
  for (let x = 0; x < 3600; x += 28) d += `Q${x + 7} 3 ${x + 14} 12T${x + 28} 12`;
  return d;
})();

export function FolkBorder({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`folk-border kantha ${className}`} aria-hidden="true">
      <svg viewBox="0 0 3600 24" preserveAspectRatio="xMinYMid slice" xmlns="http://www.w3.org/2000/svg">
        <pattern id={id} width="56" height="24" patternUnits="userSpaceOnUse">
          <path d="M28 6L34 12L28 18L22 12Z" fill="var(--mustard)" stroke="currentColor" strokeWidth="1"/>
          <circle cx="0" cy="12" r="1.6" fill="currentColor"/><circle cx="56" cy="12" r="1.6" fill="currentColor"/>
        </pattern>
        <rect width="3600" height="24" fill={`url(#${id})`} opacity=".9"/>
        <path d="M0 3H3600" className="kantha-run" strokeDasharray="10 8"/>
        <path d={wave} className="kantha-wave" strokeDasharray="7 6"/>
        <path d="M0 21H3600" className="kantha-run kantha-back" strokeDasharray="10 8"/>
      </svg>
    </div>
  );
}
