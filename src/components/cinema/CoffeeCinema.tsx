import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { CoffeeScene } from './coffeeScene';
import heroPhoto from '../../assets/food/hero-tea-singara.webp';

const ease = [0.22, 1, 0.36, 1] as const;

/** Where each chapter is fully visible, as fractions of the pinned scroll. */
const CHAPTERS = [
  { id: 'pour', label: 'কাপ', range: [0, 0, 0.16, 0.22] },
  { id: 'roast', label: 'সেঁকা', range: [0.24, 0.3, 0.42, 0.48] },
  { id: 'talk', label: 'কথা', range: [0.5, 0.56, 0.68, 0.74] },
  { id: 'adda', label: 'আড্ডা', range: [0.78, 0.86, 1, 1] },
] as const;

/** Piecewise-linear map of `value` through ascending `input` stops onto `output`. */
function lerpRange(value: number, input: number[], output: number[]) {
  if (value <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (value <= input[i]) return output[i - 1] + (output[i] - output[i - 1]) * (value - input[i - 1]) / (input[i] - input[i - 1]);
  }
  return output[output.length - 1];
}

function Chapter({ progress, range, className, children }: { progress: MotionValue<number>; range: readonly number[]; className: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [a, b, c, d] = range;
  // The first chapter starts visible and only fades out; the last only fades in.
  const first = a === b;
  const last = c === d;
  const input = first ? [c, d] : last ? [a, b] : [a, b, c, d];
  const lift = reduced ? 0 : 40;
  // Function transforms keep these on the JS path; framer's accelerated scroll
  // timeline maps the range against the wrong scroll offsets here.
  const opacity = useTransform(progress, value => lerpRange(value, input, first ? [1, 0] : last ? [0, 1] : [0, 1, 1, 0]));
  const y = useTransform(progress, value => lerpRange(value, input, first ? [0, -lift] : last ? [lift, 0] : [lift, 0, 0, -lift]));
  const [visible, setVisible] = useState(first);
  useMotionValueEvent(opacity, 'change', value => setVisible(value > 0.05));
  return <motion.div className={`cine-chapter ${className}`} style={{ opacity, y, visibility: visible ? 'visible' : 'hidden' }} aria-hidden={!visible}>{children}</motion.div>;
}

/**
 * The home hero: a tall section whose stage stays pinned while the WebGL cup is
 * orbited by scroll. Four short chapters of copy fade in and out over it.
 */
export function CoffeeCinema() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CoffeeScene | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const rail = useTransform(scrollYProgress, value => value);
  const hint = useTransform(scrollYProgress, value => lerpRange(value, [0, 0.06], [1, 0]));

  useMotionValueEvent(scrollYProgress, 'change', value => scene.current?.setProgress(value));

  useEffect(() => {
    const el = canvas.current;
    const host = section.current;
    if (!el || !host) return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let visibility: IntersectionObserver | undefined;
    const onPointer = (event: PointerEvent) => scene.current?.setPointer(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);

    // three.js is loaded on demand so the rest of the page is not held up by it.
    import('./coffeeScene').then(({ CoffeeScene }) => {
      if (disposed) return;
      try {
        const instance = new CoffeeScene(el, { reduced: !!reduced });
        scene.current = instance;
        instance.setProgress(scrollYProgress.get());
        observer = new ResizeObserver(([entry]) => instance.resize(entry.contentRect.width, entry.contentRect.height));
        observer.observe(el);
        visibility = new IntersectionObserver(([entry]) => instance.setActive(entry.isIntersecting && !document.hidden));
        visibility.observe(host);
        window.addEventListener('pointermove', onPointer, { passive: true });
        setReady(true);
      } catch {
        setFailed(true);
      }
    }).catch(() => setFailed(true));

    return () => {
      disposed = true;
      observer?.disconnect();
      visibility?.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [reduced, scrollYProgress]);

  return <section className="cine" ref={section} aria-label="বৈঠকখানা — introduction">
    <div className="cine-stage">
      <canvas ref={canvas} className={`cine-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true"/>
      {failed && <img className="cine-fallback" src={heroPhoto} alt=""/>}
      <div className="cine-veil" aria-hidden="true"/>

      <Chapter progress={scrollYProgress} range={CHAPTERS[0].range} className="cine-chapter-title">
        <motion.span className="eyebrow" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.3 }}>A place for adda · Kolkata</motion.span>
        <motion.h1 initial={reduced ? false : { opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.4, ease, delay: 0.45 }}>
          এক কাপ কফি,<br/><em>অনেকটা আড্ডা।</em>
        </motion.h1>
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.8 }}>
          <p className="cine-lede">স্বাদের সঙ্গে ঐতিহ্যের এক সুন্দর আড্ডা।</p>
          <p className="cine-en">A warm gathering place where Bengali flavours, coffee, tea and conversation meet.</p>
          <div className="hero-actions"><Link to="/menu" className="button button-terracotta">Explore menu <ArrowUpRight size={17}/></Link><Link to="/about" className="text-link">Our story <ArrowUpRight size={15}/></Link></div>
        </motion.div>
      </Chapter>

      <Chapter progress={scrollYProgress} range={CHAPTERS[1].range} className="cine-chapter-right">
        <span className="cine-index">০১ — The roast</span>
        <h2>আগুনে সেঁকা<br/><em>গন্ধ।</em></h2>
        <p>Beans turned over a slow flame until the whole room smells of evening — the first thing you notice when you walk in.</p>
      </Chapter>

      <Chapter progress={scrollYProgress} range={CHAPTERS[2].range} className="cine-chapter-left">
        <span className="cine-index">০২ — The talk</span>
        <h2>কাপে কাপে<br/><em>কথা জমে।</em></h2>
        <p>The cups keep coming, the steam keeps rising and the talk runs long. Nobody here is watching the clock.</p>
      </Chapter>

      <Chapter progress={scrollYProgress} range={CHAPTERS[3].range} className="cine-chapter-end">
        <span className="cine-index">০৩ — The adda</span>
        <h2>একটা চেয়ার<br/><em>সবসময় খালি।</em></h2>
        <Link to="/menu" className="button button-terracotta">Pull up a chair — see the menu <ArrowUpRight size={17}/></Link>
      </Chapter>

      <div className="cine-rail" aria-hidden="true">
        <div className="cine-rail-track"><motion.span style={{ scaleY: rail }}/></div>
        <ol>{CHAPTERS.map(chapter => <li key={chapter.id}>{chapter.label}</li>)}</ol>
      </div>
      <motion.div className="cine-hint" style={{ opacity: hint }} aria-hidden="true"><span/>Scroll to turn the cup</motion.div>
    </div>
  </section>;
}
