import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { categories, menu } from '../data/menu';
import { ProductCard, SectionTitle, Art, FolkBorder } from '../components';
import { FolkPanel } from '../components/art/FolkPanel';
import { Kolka } from '../components/art/Kolka';
import { AddaMarquee } from '../components/art/AddaMarquee';
import { TeaDivider } from '../components/art/TeaDivider';
import { Reveal } from '../components/motion/Reveal';
import { CoffeeCinema } from '../components/cinema/CoffeeCinema';

const ease = [0.22, 1, 0.36, 1] as const;
const MotionLink = motion.create(Link);

export default function Home() {
  const reduced = useReducedMotion();
  const featured = menu.filter(item => item.featured).slice(0, 3);

  // The kolkas in the favourites band drift at different speeds (parallax).
  const featuredRef = useRef<HTMLElement>(null);
  const { scrollYProgress: featuredProgress } = useScroll({ target: featuredRef, offset: ['start end', 'end start'] });
  const kolkaAY = useTransform(featuredProgress, [0, 1], [reduced ? 0 : 80, reduced ? 0 : -120]);
  const kolkaBY = useTransform(featuredProgress, [0, 1], [reduced ? 0 : -60, reduced ? 0 : 140]);

  return <div className="home">
    <CoffeeCinema/>

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
