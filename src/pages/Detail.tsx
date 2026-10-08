import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Leaf, Minus, Plus } from 'lucide-react';
import { getItem } from '../data/menu';
import { money, priceFor, useStore } from '../store';
import { Art } from '../components';

export default function Detail() {
  const { itemId } = useParams();
  const item = getItem(itemId ?? '');
  const navigate = useNavigate();
  const add = useStore(state => state.add);
  const [customizations, setCustomizations] = useState<Record<string, string>>(() => Object.fromEntries((item?.customizations ?? []).map(group => [group.id, group.options[0].id])));
  const [quantity, setQuantity] = useState(1);

  if (!item) return <div className="state-page"><Art kind="fish"/><h1>এই পদটি আজ মেনুতে নেই</h1><p>হয়তো শেষ হয়ে গেছে, তবে আরও অনেক কিছু আছে।</p><Link className="button button-dark" to="/menu">মেনু দেখুন</Link></div>;

  const unitPrice = priceFor(item, customizations);
  return <div className="detail"><Link to="/menu" className="back-link"><ArrowLeft size={16}/> Back to menu</Link><div className="detail-grid"><div className="detail-image"><img src={item.image} alt={item.en}/><span className="image-note">Handmade · Fresh</span></div><div className="detail-copy"><span className="eyebrow">{item.category} · {item.time} min</span><h1>{item.bn}</h1><h2>{item.en}</h2><strong className="detail-price">{money(unitPrice)}</strong><p className="detail-desc">{item.description}</p><div className="detail-tags">{item.veg && <span><Leaf size={14}/> Vegetarian</span>}<span><Check size={14}/> Made to order</span></div><p className="label">Ingredients</p><p className="ingredients">{item.ingredients.join(' · ')}</p>{item.allergens && <p className="allergens">Allergens: {item.allergens}</p>}
    {item.customizations?.map(group => <fieldset key={group.id}><legend>{group.label}</legend><div className="option-row">{group.options.map(option => <button type="button" aria-pressed={customizations[group.id] === option.id} className={customizations[group.id] === option.id ? 'option selected' : 'option'} onClick={() => setCustomizations(current => ({ ...current, [group.id]: option.id }))} key={option.id}>{option.label}{option.delta > 0 && <small>+{money(option.delta)}</small>}</button>)}</div></fieldset>)}
    <div className="add-row"><div className="quantity" aria-label="Quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15}/></button><b aria-live="polite">{quantity}</b><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15}/></button></div><button className="button button-terracotta add-large" onClick={() => { add(item, customizations, quantity); navigate('/cart'); }}>Add to cart · {money(unitPrice * quantity)}</button></div>
  </div></div></div>;
}
