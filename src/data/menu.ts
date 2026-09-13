import { catalog } from '../../shared/catalog';
import type { MenuItem } from '../types';

export { categories, getCategory } from '../../shared/catalog';

const imageModules = import.meta.glob('../assets/food/*.{jpg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const imageFor = (id: string) => {
  const entry = Object.entries(imageModules).find(([path]) =>
    path.endsWith(`/${id}.jpg`) || path.endsWith(`/${id}.png`));
  if (!entry) throw new Error(`Missing local menu image: ${id}`);
  return entry[1];
};

export const menu: MenuItem[] = catalog.map(item => ({ ...item, image: imageFor(item.id) }));
export const getItem = (id: string) => menu.find(item => item.id === id);
