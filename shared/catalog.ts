import type { Category, MenuItem } from '../src/types';

export type CatalogItem = Omit<MenuItem, 'image'>;
const dish = (data: CatalogItem): CatalogItem => data;

export const categories: { id: Category; bn: string; en: string }[] = [
  { id: 'tea', bn: 'চা ও কফি', en: 'Tea & Coffee' },
  { id: 'snacks', bn: 'জলখাবার', en: 'Snacks' },
  { id: 'bengali', bn: 'বাঙালির প্রিয়', en: 'Bengali Favourites' },
  { id: 'mains', bn: 'প্রধান পদ', en: 'Main Course' },
  { id: 'desserts', bn: 'মিষ্টিমুখ', en: 'Desserts' },
  { id: 'cold', bn: 'ঠান্ডা পানীয়', en: 'Cold Drinks' },
];

const teaOptions = [
  { id: 'size', label: 'Cup size', options: [{ id: 'regular', label: 'Regular', delta: 0 }, { id: 'large', label: 'Large', delta: 3000 }] },
  { id: 'sugar', label: 'Sweetness', options: [{ id: 'regular', label: 'Regular', delta: 0 }, { id: 'less', label: 'Less sugar', delta: 0 }, { id: 'none', label: 'No sugar', delta: 0 }] },
];
const coffeeOptions = [
  { id: 'size', label: 'Cup size', options: [{ id: 'regular', label: 'Regular', delta: 0 }, { id: 'large', label: 'Large', delta: 4000 }] },
  { id: 'sugar', label: 'Sweetness', options: [{ id: 'regular', label: 'Regular', delta: 0 }, { id: 'less', label: 'Less sugar', delta: 0 }, { id: 'none', label: 'No sugar', delta: 0 }] },
];

export const catalog: CatalogItem[] = [
  dish({ id: 'matir-bhar-cha', bn: 'মাটির ভাঁড় চা', en: 'Matir Bhar Cha', category: 'tea', description: 'Slow-brewed milk tea served in an earthy clay cup, just like an adda on a Kolkata corner.', price: 9000, tags: ['chai', 'clay cup', 'milk tea'], time: 7, veg: true, bestseller: true, featured: true, ingredients: ['Assam tea', 'milk', 'cardamom'], allergens: 'Milk', customizations: teaOptions }),
  dish({ id: 'lebu-cha', bn: 'লেবু চা', en: 'Lebu Cha', category: 'tea', description: 'Bright lemon tea with a little ginger and a refreshingly gentle finish.', price: 8000, tags: ['lemon tea', 'ginger'], time: 6, veg: true, bestseller: true, ingredients: ['Black tea', 'lemon', 'ginger'], customizations: teaOptions }),
  dish({ id: 'malai-coffee', bn: 'মালাই কফি', en: 'Malai Coffee', category: 'tea', description: 'Strong coffee softened with a generous cloud of velvety malai.', price: 18000, tags: ['coffee', 'cream'], time: 8, veg: true, featured: true, ingredients: ['Coffee', 'milk', 'malai'], allergens: 'Milk', customizations: coffeeOptions }),
  dish({ id: 'ada-chai', bn: 'আদা চা', en: 'Ada Chai', category: 'tea', description: 'A warming ginger-forward chai, brewed slowly until fragrant.', price: 26000, tags: ['chai', 'ginger'], time: 7, veg: true, ingredients: ['Black tea', 'ginger', 'milk'], allergens: 'Milk', customizations: teaOptions }),
  dish({ id: 'singara', bn: 'সিঙাড়া', en: 'Singara', category: 'snacks', description: 'Crisp golden pastry filled with warmly spiced potato and peas.', price: 7000, tags: ['samosa', 'potato', 'crispy', 'সিঙ্গারা'], time: 12, veg: true, bestseller: true, featured: true, ingredients: ['Flour', 'potato', 'peas', 'spices'], allergens: 'Wheat' }),
  dish({ id: 'beguni', bn: 'বেগুনি', en: 'Beguni', category: 'snacks', description: 'Thin aubergine slices dipped in a spiced gram-flour batter and fried crisp.', price: 8500, tags: ['eggplant', 'aubergine', 'fritter'], time: 12, veg: true, ingredients: ['Aubergine', 'gram flour', 'spices'] }),
  dish({ id: 'mochar-chop', bn: 'মোচার চপ', en: 'Mochar Chop', category: 'snacks', description: 'Banana-blossom croquettes with a crunchy crumb and classic Bengali spice.', price: 11000, tags: ['banana blossom', 'croquette'], time: 15, veg: true, ingredients: ['Banana blossom', 'potato', 'spices', 'breadcrumbs'], allergens: 'Wheat' }),
  dish({ id: 'fish-fry', bn: 'ফিশ ফ্রাই', en: 'Fish Fry', category: 'snacks', description: 'Kolkata-style crumb-fried fish, served golden and made for a long conversation.', price: 24000, tags: ['fish', 'fried', 'Kolkata'], time: 18, veg: false, ingredients: ['Fish', 'breadcrumbs', 'spices'], allergens: 'Fish, wheat' }),
  dish({ id: 'kosha-mangsho', bn: 'কষা মাংস', en: 'Kosha Mangsho', category: 'bengali', description: 'Slow-cooked mutton in a deep, rich Bengali spice gravy.', price: 28000, tags: ['mutton', 'curry'], time: 25, veg: false, ingredients: ['Mutton', 'onion', 'ginger', 'spices'] }),
  dish({ id: 'luchi-alurdom', bn: 'লুচি আলুর দম', en: 'Luchi & Alur Dom', category: 'bengali', description: 'Puffed luchis alongside potatoes simmered in a comforting spiced gravy.', price: 21000, tags: ['luchi', 'potato', 'breakfast'], time: 18, veg: true, ingredients: ['Flour', 'potato', 'tomato', 'spices'], allergens: 'Wheat' }),
  dish({ id: 'ghugni', bn: 'ঘুগনি', en: 'Ghugni', category: 'bengali', description: 'Tender yellow peas with tangy spice, onion and a squeeze of lime.', price: 13000, tags: ['peas', 'street food'], time: 15, veg: true, ingredients: ['Yellow peas', 'onion', 'lime', 'spices'] }),
  dish({ id: 'macher-jhol', bn: 'মাছের ঝোল', en: 'Macher Jhol', category: 'bengali', description: 'Homestyle fish curry in a light, fragrant tomato-and-turmeric broth.', price: 32000, tags: ['fish', 'curry'], time: 22, veg: false, ingredients: ['Fish', 'tomato', 'turmeric', 'mustard oil'], allergens: 'Fish, mustard' }),
  dish({ id: 'basanti-pulao', bn: 'বাসন্তী পোলাও', en: 'Basanti Pulao', category: 'mains', description: 'Golden, fragrant Bengali pulao with gentle sweetness and warm spices.', price: 24000, tags: ['rice', 'pulao'], time: 20, veg: true, ingredients: ['Rice', 'ghee', 'saffron', 'spices'], allergens: 'Milk' }),
  dish({ id: 'chingri-malai', bn: 'চিংড়ি মালাইকারি', en: 'Chingri Malai Curry', category: 'mains', description: 'Prawns in a silky coconut-milk curry, a beloved Bengali celebration dish.', price: 38000, tags: ['prawn', 'seafood', 'coconut'], time: 25, veg: false, ingredients: ['Prawns', 'coconut milk', 'spices'], allergens: 'Shellfish' }),
  dish({ id: 'murgi-jhol', bn: 'মুরগির ঝোল', en: 'Murgir Jhol', category: 'mains', description: 'A homestyle chicken curry with potatoes and a light, deeply savoury gravy.', price: 30000, tags: ['chicken', 'curry'], time: 24, veg: false, ingredients: ['Chicken', 'potato', 'onion', 'spices'] }),
  dish({ id: 'mishti-doi', bn: 'মিষ্টি দই', en: 'Mishti Doi', category: 'desserts', description: 'Set sweet yoghurt with the gentle caramel warmth of Bengal.', price: 12000, tags: ['yoghurt', 'sweet'], time: 5, veg: true, bestseller: true, ingredients: ['Milk', 'jaggery'], allergens: 'Milk' }),
  dish({ id: 'nolen-gurer-payesh', bn: 'নলেন গুড়ের পায়েস', en: 'Nolen Gurer Payesh', category: 'desserts', description: 'Slow-cooked rice pudding sweetened with aromatic date-palm jaggery.', price: 16000, tags: ['rice pudding', 'jaggery'], time: 8, veg: true, ingredients: ['Rice', 'milk', 'date-palm jaggery'], allergens: 'Milk' }),
  dish({ id: 'baked-rosogolla', bn: 'বেকড রসগোল্লা', en: 'Baked Rosogolla', category: 'desserts', description: 'Soft chhena dumplings baked in a luscious, lightly caramelised cream.', price: 14000, tags: ['rasgulla', 'chhena'], time: 9, veg: true, ingredients: ['Chhena', 'milk', 'sugar'], allergens: 'Milk' }),
  dish({ id: 'sandesh', bn: 'নলেন গুড়ের সন্দেশ', en: 'Nolen Gurer Sandesh', category: 'desserts', description: 'Soft Bengali chhena sweets lifted by the fragrance of date-palm jaggery.', price: 13000, tags: ['sandesh', 'jaggery'], time: 5, veg: true, ingredients: ['Chhena', 'date-palm jaggery'], allergens: 'Milk' }),
  dish({ id: 'aam-pora-shorbot', bn: 'আম পোড়া শরবত', en: 'Aam Pora Shorbot', category: 'cold', description: 'A smoky, tangy cooler made with roasted green mango and spices.', price: 11000, tags: ['mango', 'shorbot'], time: 8, veg: true, ingredients: ['Green mango', 'mint', 'black salt'] }),
  dish({ id: 'bael-panna', bn: 'বেল পান্না', en: 'Bael Panna', category: 'cold', description: 'A cooling seasonal bael-fruit drink with a soft, earthy sweetness.', price: 10000, tags: ['bael', 'fruit'], time: 8, veg: true, ingredients: ['Bael fruit', 'water', 'jaggery'] }),
  dish({ id: 'cold-coffee', bn: 'কোল্ড কফি', en: 'Cold Coffee', category: 'cold', description: 'Chilled, creamy coffee for the afternoons that need to last longer.', price: 16000, tags: ['coffee', 'iced'], time: 8, veg: true, ingredients: ['Coffee', 'milk', 'ice'], allergens: 'Milk' }),
  dish({ id: 'chaas', bn: 'ঘোল', en: 'Chaas', category: 'cold', description: 'Lightly spiced buttermilk, cool and refreshing with a hint of roasted cumin.', price: 9000, tags: ['buttermilk', 'cumin'], time: 6, veg: true, ingredients: ['Buttermilk', 'cumin', 'salt'], allergens: 'Milk' }),
];

export const getCatalogItem = (id: string) => catalog.find(item => item.id === id);
export const getCategory = (id: string) => categories.find(category => category.id === id);
