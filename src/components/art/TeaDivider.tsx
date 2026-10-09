import { TeaCup } from './TeaCup';
import { Reveal } from '../motion/Reveal';

/** A section break: kantha-style dotted line with a steaming bhar in the middle. */
export function TeaDivider({ note, className = '' }: { note?: string; className?: string }) {
  return (
    <div className={`tea-divider ${className}`} aria-hidden="true">
      <span className="tea-divider-line"/>
      <Reveal className="tea-divider-cup" y={16}><TeaCup/>{note && <small>{note}</small>}</Reveal>
      <span className="tea-divider-line"/>
    </div>
  );
}
