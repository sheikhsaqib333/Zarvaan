import type { Product } from '../types/clothing';
import type { HeroSlideConfig } from '../types/siteConfig';
import {
  HERO_IMAGE,
  SUMMER_LAWN_IMAGE,
  LAWN_PRINTS_IMAGE,
  DHANAK_KHADDAR_IMAGE,
  VELVET_CRAFT_IMAGE,
  EDITORIAL_MODEL_IMAGE,
} from '../data/products';

const DEFAULT_HERO_SLIDES: HeroSlideConfig[] = [
  {
    id: 'slide-lawn-prints',
    image: LAWN_PRINTS_IMAGE,
    category: 'Lawn Printed Suits',
    season: 'summer',
    caption: 'Airy 80s combed digital lawn with fluid featherlight chiffon dupatta.',
    dropTag: 'DROP 01 · SUMMER',
  },
  {
    id: 'slide-lawn-replica',
    image: EDITORIAL_MODEL_IMAGE,
    category: 'Lawn Replica',
    season: 'summer',
    caption: 'Master replica couture featuring luxury schiffli organza embroidery cutwork.',
    dropTag: 'COUTURE REPLICA',
  },
  {
    id: 'slide-lawn-embroidery',
    image: SUMMER_LAWN_IMAGE,
    category: 'Lawn Embroidery Suits',
    season: 'summer',
    caption: 'Breathable summer lawn enriched with delicate multi-color thread needlework.',
    dropTag: 'LUXE EMBROIDERY',
  },
  {
    id: 'slide-cotton-plain',
    image: HERO_IMAGE,
    category: 'Cotton Plain Fabric',
    season: 'summer',
    caption: '100% fine Egyptian combed cotton unstitched yardage with crisp hand-feel.',
    dropTag: 'PURE SOLID BASICS',
  },
  {
    id: 'slide-khaddar-printed',
    image: DHANAK_KHADDAR_IMAGE,
    category: 'Khaddar Unstitch Printed Suit',
    season: 'winter',
    caption: 'Heavy slub textured khaddar crafted for cozy winter warmth and structured drape.',
    dropTag: 'WINTER TEXTURE',
  },
  {
    id: 'slide-dhanak-printed',
    image: '/src/assets/images/zavraan_winter_shawl_1790586750219.jpg',
    category: 'Dhanak Unstitch Printed Suits',
    season: 'winter',
    caption: 'Double-brushed winter dhanak suit decorated with rich Kashmiri ethnic motifs.',
    dropTag: 'WARMTH VAULT',
  },
  {
    id: 'slide-khaddar-embroidery',
    image: VELVET_CRAFT_IMAGE,
    category: 'Khaddar Embroidery',
    season: 'winter',
    caption: 'Royal winter khaddar enriched with antique tilla and resham threadwork.',
    dropTag: 'FESTIVE THREADS',
  },
];

const CATEGORY_CAPTIONS: Record<string, string> = {
  'Lawn Printed Suits': 'Airy 80s combed digital lawn with fluid featherlight chiffon dupatta.',
  'Lawn Replica': 'Master replica couture featuring luxury schiffli organza embroidery cutwork.',
  'Lawn Embroidery Suits': 'Breathable summer lawn enriched with delicate thread needlework.',
  'Lawn Plain Fabric': 'Airjet-woven combed swiss lawn unstitched fabric in solid pastels.',
  'Cotton Plain Fabric': '100% fine Egyptian combed cotton unstitched yardage with crisp hand-feel.',
  'Cotton Embroidery': 'Fine cotton cambric suit with detailed daman borders and neckline patches.',
  'Khaddar Unstitch Printed Suit': 'Heavy slub textured khaddar crafted for cozy winter warmth.',
  'Dhanak Unstitch Printed Suits': 'Double-brushed winter dhanak suit decorated with rich Kashmiri motifs.',
  'Khaddar Embroidery': 'Royal winter khaddar enriched with antique tilla and resham threadwork.',
  'Dhanak Embroidery': 'Regal winter dhanak featuring metallic zari and embroidered velvet trims.',
};

export const buildDefaultHeroSlides = (
  products: Product[],
  featuredImage?: string
): HeroSlideConfig[] => {
  if (!products.length) {
    const fallback = DEFAULT_HERO_SLIDES.map((slide) => ({ ...slide }));
    if (featuredImage) {
      fallback[0] = { ...fallback[0], image: featuredImage };
    }
    return fallback;
  }

  const productSlides = products
    .filter((product) => product.primaryImage)
    .slice(0, 8)
    .map((product) => ({
      id: `slide-prod-${product.id}`,
      image: product.primaryImage,
      category: product.category,
      season: product.season,
      caption:
        CATEGORY_CAPTIONS[product.category] ||
        (product.description.length > 75
          ? `${product.description.slice(0, 75)}...`
          : product.description),
      dropTag: product.season === 'summer' ? 'SUMMER DROP' : 'WINTER VAULT',
    }));

  if (featuredImage && productSlides[0]) {
    productSlides[0] = { ...productSlides[0], image: featuredImage };
  }

  const covered = new Set<string>(productSlides.map((slide) => slide.category));
  const supplemental = DEFAULT_HERO_SLIDES.filter((slide) => !covered.has(slide.category));
  return [...productSlides, ...supplemental].slice(0, 7);
};