import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;
const tags = { div: motion.div, section: motion.section, article: motion.article, li: motion.li, span: motion.span };

/** Fades and lifts a block when it scrolls into view. `delay` staggers siblings. */
export function Reveal({ children, delay = 0, className = '', as = 'div', y = 26 }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'article' | 'li' | 'span'; y?: number }) {
  const reduced = useReducedMotion();
  const Tag = tags[as];
  return (
    <Tag className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, ease, delay }}>
      {children}
    </Tag>
  );
}

/** Plays once on mount — used for the hero, which is already in view on load. */
export function Rise({ children, delay = 0, className = '', y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay }}>
      {children}
    </motion.div>
  );
}
