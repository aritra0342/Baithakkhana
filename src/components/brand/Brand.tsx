import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import logo from '../../assets/brand/baithakkhana-transparent.png';

export function Brand({ variant = 'header' }: { variant?: 'header' | 'footer' | 'hero' | 'success' }) {
  const reduced = useReducedMotion();
  return <Link to="/" className={`brand brand-${variant}`} aria-label="বৈঠকখানা — Home">
    <motion.span className="brand-crop" initial={reduced ? false : { opacity: 0, y: 5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={reduced ? undefined : { scale: 1.025 }} transition={{ type: 'spring', stiffness: 155, damping: 24, mass: 0.7 }}>
      <img src={logo} alt="" className="brand-image brand-image-base"/>
      <motion.img src={logo} alt="" className="brand-image brand-image-steam" aria-hidden="true"
        animate={reduced ? undefined : { y: [1, -2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4.8, ease: 'easeInOut', repeat: Infinity }}/>
    </motion.span>
  </Link>;
}
