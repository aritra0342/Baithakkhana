import type { Category, MenuItem } from '../types';

export type MenuFilters = {
  category?: Category;
  query?: string;
  vegetarian?: boolean;
  bestsellers?: boolean;
  sort?: 'default' | 'price-low' | 'price-high';
};

export function filterMenu(items: MenuItem[], filters: MenuFilters) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';
  return items.filter(item =>
    (!filters.category || item.category === filters.category) &&
    (!filters.vegetarian || item.veg) &&
    (!filters.bestsellers || item.bestseller) &&
    (!query || [item.bn, item.en, item.description, ...item.tags].join(' ').toLocaleLowerCase().includes(query))
  ).sort((a, b) => filters.sort === 'price-low' ? a.price - b.price : filters.sort === 'price-high' ? b.price - a.price : 0);
}
