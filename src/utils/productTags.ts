import type { ProductTag } from '../types/clothing';

export const PRODUCT_TAG_LABELS: Record<ProductTag, string> = {
  'sold-out': 'Sold Out',
  'limited-stock': 'Limited Stock',
  'last-piece': 'Last Piece',
  'new-design': 'New Design',
  trending: 'Trending',
};

export const PRODUCT_TAG_STYLES: Record<ProductTag, string> = {
  'sold-out': 'bg-rose-700 text-white',
  'limited-stock': 'bg-orange-100 text-orange-950',
  'last-piece': 'bg-red-700 text-white',
  'new-design': 'bg-stone-950 text-amber-300',
  trending: 'bg-emerald-800 text-white',
};