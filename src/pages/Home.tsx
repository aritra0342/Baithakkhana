import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Clock, Leaf } from 'lucide-react';
import { categories, menu } from '../data/menu';
import { ProductCard, SectionTitle, Art, FolkBorder } from '../components';
import { FolkPanel } from '../components/art/FolkPanel';
import { Alpana } from '../components/art/Alpana';
import { Kolka } from '../components/art/Kolka';
import { AddaMarquee } from '../components/art/AddaMarquee';
import { TeaDivider } from '../components/art/TeaDivider';
import { Reveal, Rise } from '../components/motion/Reveal';
import heroPhoto from '../assets/food/hero-tea-singara.webp';

const ease = [0.22, 1, 0.36, 1] as const;
const MotionLink = motion.create(Link);

export default function Home() {
  const reduced = useReducedMotion();
  const featured = menu.filter(item => item.featured).slice(0, 3);

  // Scroll-linked motion: the sun climbs and the alpana turns as the hero scrolls away;
  // the kolkas in the favourites band drift at different speeds (parallax).
  const heroRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const { scrollYProgress: featuredProgress } = useScroll({ target: featuredRef, offset: ['start end', 'end start'] });
  const sunY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -140]);
  const sunRotate = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : 40]);
  const alpanaRotate = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : 60]);
  const alpanaScale = useTransform(heroProgress, [0, 1], [1, reduced ? 1 : 1.18]);
  const photoY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : 70]);
  const fishX = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -90]);
  const kolkaAY = useTransform(featuredProgress, [0, 1], [reduced ? 0 : 80, reduced ? 0 : -120]);
  const kolkaBY = useTransform(featuredProgress, [0, 1], [reduced ? 0 : -60, reduced ? 0 : 140]);

  return <div className="home">
    <section className="hero" ref={heroRef}>
      <div className="hero-copy">
        <Rise delay={0.05}><span className="eyebrow">A place for adda · Kolkata</span></Rise>
        <Rise delay={0.15}><h1>চায়ের কাপে<br/><em>একটু গল্প</em> হোক।</h1></Rise>
        <Rise delay={0.3}><p className="hero-lede">স্বাদের সঙ্গে ঐতিহ্যের এক সুন্দর আড্ডা।</p><p className="hero-en">A warm gathering place where Bengali flavours, tea and conversation meet.</p></Rise>
        <Rise delay={0.42}><div className="hero-actions"><Link to="/menu" className="button button-terracotta">Explore menu <ArrowUpRight size={17}/></Link><Link to="/about" className="text-link">Our story <ArrowUpRight size={15}/></Link></div></Rise>
        <Rise delay={0.55}><ul className="values"><li><Leaf/> Freshly prepared</li><li><Clock/> Bengali-inspired flavours</li></ul></Rise>
      </div>
      <div className="hero-visual">
        <motion.div className="hero-alpana-wrap" style={{ rotate: alpanaRotate, scale: alpanaScale }}><Alpana className="hero-alpana"/></motion.div>
        <motion.div className="hero-sun-wrap" style={{ y: sunY, rotate: sunRotate }}
          initial={reduced ? false : { opacity: 0, y: 60, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease, delay: 0.5 }}>
          <Art kind="sun" className="hero-sun"/>
        </motion.div>
        <motion.div className="hero-photo" style={{ y: photoY }}
          initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)', scale: 1.04 }}
          animate={{ clipPath: 'inset(0 0 0 0)', scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.2 }}>
          <img src={heroPhoto} alt="Clay cup of tea and two singara on a café table"/>
        </motion.div>
        <motion.div className="hero-fish-wrap" style={{ x: fishX }}
          initial={reduced ? false : { opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease, delay: 0.8 }}>
          <Art kind="fish" className="hero-fish"/>
        </motion.div>
        <span className="vertical-note">চা · গল্প · আড্ডা</span>
      </div>
    </section>

    <AddaMarquee/>

    <section className="home-categories">
      <div className="categories-heading">
        <Reveal><SectionTitle eyebrow="From our kitchen" title="আজ কী খাওয়া যায়?" sub="একটা টেবিল, অনেক গল্প — আপনার মেজাজ মতো বেছে নিন।"/></Reveal>
        <Art kind="vine" className="category-vine"/>
      </div>
      <motion.nav className="category-list" aria-label="Menu categories"
        initial={reduced ? false : 'hidden'} whileInView="show" viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
        {categories.map((category, index) => (
          <MotionLink key={category.id} to={`/menu/${category.id}`}
            variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } }}>
            <span>0{index + 1}</span><div><strong>{category.bn}</strong><small>{category.en}</small></div><ArrowUpRight/>
          </MotionLink>
        ))}
      </motion.nav>
    </section>

    <section className="featured" id="specials" ref={featuredRef}>
      <motion.div className="featured-kolka kolka-a" style={{ y: kolkaAY }}><Kolka/></motion.div>
      <motion.div className="featured-kolka kolka-b" style={{ y: kolkaBY }}><Kolka flip/></motion.div>
      <FolkBorder className="featured-border"/>
      <div className="featured-inner">
        <Reveal><SectionTitle eyebrow="The house favourites" title="আড্ডার সঙ্গে যা জমে" sub="যে পদগুলো টেবিলে সবচেয়ে বেশি ঘোরে।"/></Reveal>
        <div className="featured-grid">{featured.map((item, index) => <ProductCard item={item} index={index} key={item.id}/>)}</div>
        <Reveal className="see-all-wrap"><Link className="button button-outline see-all" to="/menu">See the full menu <ArrowUpRight size={16}/></Link></Reveal>
      </div>
    </section>

    <section className="story-strip">
      <Reveal className="story-art" y={0}><FolkPanel/></Reveal>
      <Reveal delay={0.15}><span className="eyebrow">A little about us</span><h2>এখানে ঘড়ি একটু<br/><em>ধীরে চলে।</em></h2><p>বৈঠকখানা মানে — এমন এক ঘর যেখানে চায়ের কাপে কাপে কথা জমে, পরিচিত খাবারে মন ভালো হয়, আর নতুন বন্ধুত্বের জন্য সবসময় একটা চেয়ার খালি থাকে।</p><Link to="/about" className="text-link">আমাদের গল্প পড়ুন <ArrowUpRight size={15}/></Link></Reveal>
    </section>

    <TeaDivider note="আরেক কাপ?"/>
  </div>;
}
