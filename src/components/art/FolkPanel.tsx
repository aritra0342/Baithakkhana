import { motion, useReducedMotion } from 'framer-motion';
import painting from '../../assets/art/mithila-gathering.webp';

export function FolkPanel({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  return <motion.img
    src={painting}
    alt=""
    aria-hidden="true"
    className={`folk-panel-image ${className}`}
    loading="lazy"
    initial={reduced ? false : { opacity: 0, scale: 1.04 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  />;
}
