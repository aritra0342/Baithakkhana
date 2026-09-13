import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Art, Divider, FolkBorder } from '../components';
import { FolkPanel } from '../components/art/FolkPanel';
import coffeeHouse from '../assets/food/about-kolkata-coffee-house.jpg';

export default function About() {
  return <div className="about"><section className="about-hero"><div><span className="eyebrow">THE BOITHOKKHANA STORY</span><h1>একটা ঘর।<br/><em>হাজার গল্প।</em></h1><p>বৈঠকখানা — নামেই যার আমন্ত্রণ। বাংলার ঘরোয়া স্বাদ, কাপে কাপে চা আর এমন আড্ডা যা শেষ হওয়ার তাড়া নেই।</p></div><figure className="about-photo"><img src={coffeeHouse} alt="Interior of Kolkata's historic College Street Coffee House"/><figcaption>Inspired by Kolkata’s long tradition of coffee-house adda.</figcaption><Art kind="fish"/></figure></section><Divider/><section className="about-grid"><div><span className="eyebrow">WHAT IT MEANS</span><h2>বৈঠকখানা মানে<br/>বসার <em>একটা অজুহাত।</em></h2></div><div><p>শহরের ব্যস্ততার মধ্যে আমরা একটা ছোট্ট জায়গা বানিয়েছি — যেখানে পরিচিত মুখের পাশে অচেনা মানুষও বসে পড়ে। কড়া চায়ের গন্ধে কথা একটু সহজ হয়ে আসে।</p><p>আমাদের রান্নাঘর বেছে নেয় বাজারের ভালো জিনিস, ধীর রান্না আর বাড়ির রেসিপি। প্লেটে তাই কোনো অভিনয় নেই — শুধু মন দিয়ে বানানো খাবার।</p></div></section><FolkBorder/><section className="about-band"><FolkPanel/><div><span className="eyebrow">COME OVER</span><h2>দুপুর থেকে রাত,<br/>চেয়ারটা আপনার জন্য।</h2><p><Clock size={15}/> {import.meta.env.VITE_ORDER_MODE === 'server' ? 'Orders are shared with the café team. Online payment remains a demo.' : 'This is a demo cafe concept. Orders are saved on this device only.'}</p><Link to="/menu" className="button button-terracotta">Start Your Order <ArrowUpRight size={16}/></Link></div></section></div>;
}
