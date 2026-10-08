import { useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';

/**
 * আলপনা — the rice-paste floor painting drawn at a Bengali doorstep to welcome
 * guests. Every stroke uses pathLength="1" so a single CSS keyframe can "draw"
 * it on, ring by ring, the way it is painted by hand: centre first, then outward.
 */
const C = 300;
const ring = (count: number) => Array.from({ length: count }, (_, index) => (index * 360) / count);

const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

export function Alpana({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={`alpana ${reduced ? 'alpana-static' : ''} ${className}`} aria-hidden="true">
      <svg className="alpana-spin" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Centre: the bindu and its first lotus */}
        <g style={delay(0)}>
          <circle cx={C} cy={C} r="7" pathLength={1} fill="var(--terracotta)" stroke="none"/>
          <circle cx={C} cy={C} r="22" pathLength={1}/>
          <circle cx={C} cy={C} r="34" pathLength={1} strokeDasharray="0.012 0.03" strokeLinecap="round" strokeWidth="3.4"/>
        </g>
        <g style={delay(0.25)}>
          {ring(8).map(angle => (
            <path key={angle} pathLength={1} transform={`rotate(${angle} ${C} ${C})`} className="alpana-petal"
              d={`M${C} ${C - 44}C${C + 26} ${C - 80} ${C + 26} ${C - 128} ${C} ${C - 150}C${C - 26} ${C - 128} ${C - 26} ${C - 80} ${C} ${C - 44}Z`}/>
          ))}
          {ring(8).map(angle => (
            <path key={`v${angle}`} pathLength={1} transform={`rotate(${angle} ${C} ${C})`} strokeWidth="1.3"
              d={`M${C} ${C - 62}V${C - 132}`}/>
          ))}
        </g>
        {/* Second ring: dots and leaves between the petals */}
        <g style={delay(0.7)}>
          {ring(16).map(angle => (
            <circle key={angle} cx={C} cy={C - 165} r="4.5" pathLength={1} fill="var(--mustard)" stroke="none" transform={`rotate(${angle + 11.25} ${C} ${C})`}/>
          ))}
          <circle cx={C} cy={C} r="182" pathLength={1} strokeWidth="1.4"/>
        </g>
        <g style={delay(1)}>
          {ring(16).map(angle => (
            <path key={angle} pathLength={1} transform={`rotate(${angle} ${C} ${C})`} className="alpana-leaf"
              d={`M${C} ${C - 186}C${C + 16} ${C - 204} ${C + 14} ${C - 232} ${C} ${C - 246}C${C - 14} ${C - 232} ${C - 16} ${C - 204} ${C} ${C - 186}Z`}/>
          ))}
          {ring(16).map(angle => (
            <path key={`m${angle}`} pathLength={1} transform={`rotate(${angle} ${C} ${C})`} strokeWidth="1"
              d={`M${C} ${C - 196}V${C - 236}`}/>
          ))}
        </g>
        {/* Outer scalloped edge — the "lata" vine that frames every alpana */}
        <g style={delay(1.45)}>
          <circle cx={C} cy={C} r="256" pathLength={1} strokeWidth="1.3"/>
          {ring(24).map(angle => (
            <path key={angle} pathLength={1} transform={`rotate(${angle} ${C} ${C})`} strokeWidth="1.6"
              d={`M${C - 33} ${C - 258}Q${C} ${C - 300} ${C + 33} ${C - 258}`}/>
          ))}
          {ring(24).map(angle => (
            <circle key={`d${angle}`} cx={C} cy={C - 288} r="3" pathLength={1} fill="var(--terracotta)" stroke="none" transform={`rotate(${angle + 7.5} ${C} ${C})`}/>
          ))}
        </g>
      </svg>
    </div>
  );
}
