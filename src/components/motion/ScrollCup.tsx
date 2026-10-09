import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { TeaCup } from '../art/TeaCup';

/**
 * A clay cup pinned to the corner that fills with tea as the page is read.
 * Steam appears once the cup is mostly full. Tapping it returns to the top.
 */
export function ScrollCup() {
  const reduced = useReducedMotion();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const [level, setLevel] = useState(0);
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(progress, 'change', value => {
    setLevel(value);
    setVisible(value > 0.04);
  });
  useEffect(() => { setLevel(0); setVisible(false); }, [location.pathname]);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <motion.button type="button" className={`scroll-cup ${level > 0.7 ? 'is-full' : ''}`}
      aria-label="Back to top" title="চা শেষ? উপরে ফিরুন"
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      <TeaCup fill={level} steam={level > 0.7}/>
      <span className="scroll-cup-pct">{Math.round(level * 100)}%</span>
    </motion.button>
  );
}
