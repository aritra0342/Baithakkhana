import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, ArrowRight, Plus, Minus, Leaf, ChevronRight } from 'lucide-react';
import { categories } from './data/menu';
import { money, useStore } from './store';
import type { MenuItem } from './types';
import { Brand } from './components/brand/Brand';
import { Reveal } from './components/motion/Reveal';
import { ScrollCup } from './components/motion/ScrollCup';

export { Brand } from './components/brand/Brand';
export { FolkArt as Art, FolkBorder } from './components/art/FolkArt';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const count = useStore(s => s.items.reduce((total, item) => total + item.quantity, 0));

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawer.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const focusable = [...(drawer.current?.querySelectorAll<HTMLElement>('a') ?? [])];
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, [open]);

  return <>
    <header>
      <Brand/>
      <nav className="desktop-nav" aria-label="Main navigation"><NavLink to="/">Home</NavLink><NavLink to="/menu">Menu</NavLink><NavLink to="/about">Our story</NavLink><Link to="/#specials">Specials</Link></nav>
      <div className="header-actions"><Link to="/cart" className="cart-link"><ShoppingBag size={18}/><span>Cart</span>{count > 0 && <b aria-label={`${count} items`}>{count}</b>}</Link><span className="sr-only" aria-live="polite">{count} items in cart</span><Link to="/menu" className="button button-dark order-link">Order now <ArrowRight size={16}/></Link><button ref={menuButton} className="icon-button menu-trigger" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-controls="mobile-navigation" aria-expanded={open}>{open ? <X/> : <MenuIcon/>}</button></div>
    </header>
    {open && <nav ref={drawer} id="mobile-navigation" className="mobile-drawer" aria-label="Mobile navigation"><NavLink to="/">Home <ChevronRight/></NavLink><NavLink to="/menu">Menu <ChevronRight/></NavLink><NavLink to="/about">Our story <ChevronRight/></NavLink><NavLink to="/cart">Your cart <ChevronRight/></NavLink></nav>}
  </>;
}

export function Footer() {
  const connected = import.meta.env.VITE_ORDER_MODE === 'server';
  return <footer><div className="footer-grid"><div><Brand variant="footer"/><p>চা, গল্প আর চেনা স্বাদের<br/>একটা সুন্দর ঠিকানা।</p></div><div><small>Explore</small><p><Link to="/menu">Menu</Link><br/><Link to="/about">Our story</Link><br/><Link to="/image-credits">Photo credits</Link></p></div><div><small>{connected ? 'Ordering note' : 'Demo cafe'}</small><p>{connected ? <>Orders are sent to the staff dashboard.<br/>Online payment remains a demo.</> : <>Boithokkhana is a concept ordering experience.<br/>No real orders or payments are processed.</>}</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} বৈঠকখানা</span><span>আড্ডা চলুক — made in Kolkata</span></div></footer>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/><ScrollCup/></>;
}

export function SectionTitle({ eyebrow, title, sub, as = 'h2' }: { eyebrow: string; title: string; sub?: string; as?: 'h1' | 'h2' }) {
  const Heading = as;
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><Heading>{title}</Heading>{sub && <p>{sub}</p>}</div>;
}

export function ProductCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const add = useStore(s => s.add);
  const update = useStore(s => s.update);
  const line = useStore(s => s.items.find(line => line.itemId === item.id && Object.keys(line.customizations).length === 0));
  const nav = useNavigate();
  const hasOptions = !!item.customizations?.length;
  return <Reveal as="article" className="product-card" delay={Math.min(index % 3, 2) * 0.1}>
    <Link to={`/menu/item/${item.id}`} className="product-image"><img src={item.image} alt={item.en} loading="lazy" decoding="async"/>{item.bestseller && <span className="badge">Bestseller</span>}</Link>
    <div className="product-body"><div className="product-name"><div><h3>{item.bn}</h3><span>{item.en}</span></div><strong>{money(item.price)}</strong></div><p>{item.description}</p><div className="product-meta"><span>{item.time} min</span>{item.veg && <span><Leaf size={13}/> Veg</span>}</div>
      {hasOptions ? <button className="button button-outline" onClick={() => nav(`/menu/item/${item.id}`)}>Choose options <ChevronRight size={15}/></button> : line ? <Quantity value={line.quantity} onChange={quantity => update(line.key, quantity)}/> : <button className="button button-terracotta" onClick={() => add(item, {}, 1)}>Add to order <Plus size={15}/></button>}
    </div>
  </Reveal>;
}

export function Quantity({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return <div className="quantity" aria-label="Quantity"><button onClick={() => onChange(value - 1)} aria-label="Decrease quantity"><Minus size={15}/></button><b aria-live="polite">{value}</b><button onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={15}/></button></div>;
}

export function Divider() { return <div className="divider" aria-hidden="true"><span>✦</span></div>; }
