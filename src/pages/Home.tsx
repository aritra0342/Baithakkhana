import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Leaf } from 'lucide-react';
import { categories, menu } from '../data/menu';
import { ProductCard, SectionTitle, Art, FolkBorder } from '../components';
import { FolkPanel } from '../components/art/FolkPanel';
import heroPhoto from '../assets/food/hero-tea-singara.webp';

export default function Home() {
  const featured = menu.filter(item => item.featured).slice(0, 3);
  return <div className="home">
    <section className="hero"><div className="hero-copy"><span className="eyebrow">A PLACE FOR ADDA · KOLKATA</span><h1>চায়ের কাপে<br/><em>একটু গল্প</em> হোক।</h1><p className="hero-lede">স্বাদের সঙ্গে ঐতিহ্যের এক সুন্দর আড্ডা।</p><p className="hero-en">A warm gathering place where Bengali flavours, tea and conversation meet.</p><div className="hero-actions"><Link to="/menu" className="button button-terracotta">Explore Menu <ArrowUpRight size={17}/></Link><Link to="/about" className="text-link">Our Story <span>↗</span></Link></div><div className="values"><span><Leaf/> Freshly Prepared</span><span><Clock/> Bengali-inspired flavours</span></div></div>
      <div className="hero-visual"><Art kind="sun" className="hero-sun"/><div className="hero-photo"><img src={heroPhoto} alt="Clay cup of tea and two singara on a café table"/></div><Art kind="fish" className="hero-fish"/><span className="vertical-note">চা · গল্প · আড্ডা</span></div>
    </section>
    <FolkBorder className="page-border"/>
    <section className="home-categories"><div className="categories-heading"><SectionTitle eyebrow="FROM OUR KITCHEN" title="আজ কী খাওয়া যায়?" sub="একটা টেবিল, অনেক গল্প — আপনার মেজাজ মতো বেছে নিন।"/><Art kind="vine" className="category-vine"/></div><div className="category-list">{categories.map((category, index) => <Link key={category.id} to={`/menu/${category.id}`}><span>0{index + 1}</span><div><strong>{category.bn}</strong><small>{category.en}</small></div><ArrowUpRight/></Link>)}</div></section>
    <section className="featured" id="specials"><SectionTitle eyebrow="THE HOUSE FAVOURITES" title="আড্ডার সঙ্গে যা জমে"/><div className="featured-grid">{featured.map((item, index) => <ProductCard item={item} index={index} key={item.id}/>)}</div><Link className="button button-outline see-all" to="/menu">See the full menu <ArrowUpRight size={16}/></Link></section>
    <section className="story-strip"><div className="story-art"><FolkPanel/></div><div><span className="eyebrow">A LITTLE ABOUT US</span><h2>এখানে ঘড়ি একটু<br/><em>ধীরে চলে।</em></h2><p>বৈঠকখানা মানে — এমন এক ঘর যেখানে চায়ের কাপে কাপে কথা জমে, পরিচিত খাবারে মন ভালো হয়, আর নতুন বন্ধুত্বের জন্য সবসময় একটা চেয়ার খালি থাকে।</p><Link to="/about" className="text-link">আমাদের গল্প পড়ুন <ArrowUpRight size={15}/></Link></div></section>
  </div>;
}
