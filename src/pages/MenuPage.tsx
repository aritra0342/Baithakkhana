import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories, menu, getCategory } from '../data/menu';
import { Art, FolkBorder, ProductCard, SectionTitle } from '../components';
import { filterMenu } from '../lib/filterMenu';
import type { Category } from '../types';

export default function MenuPage() {
  const { category } = useParams();
  const [query, setQuery] = useState('');
  const [vegetarian, setVegetarian] = useState(false);
  const [bestsellers, setBestsellers] = useState(false);
  const [sort, setSort] = useState<'default' | 'price-low' | 'price-high'>('default');
  const active = category ?? 'all';
  const invalidCategory = category && !getCategory(category);

  const items = useMemo(() => filterMenu(menu, { category: active === 'all' ? undefined : active as Category, query, vegetarian, bestsellers, sort }), [active, vegetarian, bestsellers, query, sort]);

  if (invalidCategory) return <div className="state-page"><Art kind="fish"/><h1>এই বিভাগটি মেনুতে নেই</h1><p>চেনা স্বাদগুলো খুঁজতে পুরো মেনুতে ফিরে যান।</p><Link className="button button-dark" to="/menu">See the full menu</Link></div>;

  return <div className="menu-page"><div className="menu-intro"><SectionTitle as="h1" eyebrow="THE MENU" title="খাবার, চা, আর একটু সময়" sub="চেনা স্বাদের সঙ্গে নতুন করে দেখা। সবকিছু রান্না হয় অর্ডার পেলে।"/><Art kind="lotus" className="menu-ornament"/></div><FolkBorder/>
    <nav className="category-tabs" aria-label="Menu categories"><Link className={active === 'all' ? 'active' : ''} to="/menu" aria-current={active === 'all' ? 'page' : undefined}>সবকিছু</Link>{categories.map(item => <Link className={active === item.id ? 'active' : ''} key={item.id} to={`/menu/${item.id}`} aria-current={active === item.id ? 'page' : undefined}>{item.bn}<small>{item.en}</small></Link>)}</nav>
    <div className="filters"><label className="search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="চা, সিঙ্গারা, মিষ্টি..." aria-label="Search menu"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label><div className="filter-buttons"><button className={vegetarian ? 'selected' : ''} aria-pressed={vegetarian} onClick={() => setVegetarian(!vegetarian)}>শুধু নিরামিষ</button><button className={bestsellers ? 'selected' : ''} aria-pressed={bestsellers} onClick={() => setBestsellers(!bestsellers)}>Bestsellers</button><select value={sort} onChange={event => setSort(event.target.value as typeof sort)} aria-label="Sort menu"><option value="default">Sort: Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div></div>
    <div className="result-line"><span aria-live="polite">{items.length} items to make your day</span><SlidersHorizontal size={16}/></div>
    {items.length ? <div className="menu-grid">{items.map((item, index) => <ProductCard key={item.id} item={item} index={index}/>)}</div> : <div className="state-page compact"><Art kind="lotus"/><h2>এই স্বাদটা খুঁজে পেলাম না</h2><p>অন্য কোনো নাম দিয়ে আবার চেষ্টা করুন — রান্নাঘরে অনেক গল্প আছে।</p><button className="button button-outline" onClick={() => { setQuery(''); setVegetarian(false); setBestsellers(false); }}>সবকিছু দেখুন</button></div>}
  </div>;
}
