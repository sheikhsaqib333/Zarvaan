import type { Season } from './clothing';
import { DHANAK_KHADDAR_IMAGE, LAWN_PRINTS_IMAGE } from '../data/products';

export interface HeroSlideConfig {
  id: string;
  image: string;
  category: string;
  season: Season;
  caption: string;
  dropTag?: string;
}

export interface HomeScreenConfig {
  announcementBadge: string;
  headlinePart1: string;
  headlinePart2: string;
  subheadline: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  previewNotice: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  heroImage?: string;
  heroSlides?: HeroSlideConfig[];
}

export interface CategoriesConfig {
  summerCollectionTitle: string;
  summerCollectionSubtitle: string;
  summerCategories: string[];
  winterCollectionTitle: string;
  winterCollectionSubtitle: string;
  winterCategories: string[];
}

export interface NavigationLinkConfig {
  visible: boolean;
  label: string;
}

export interface NavigationConfig {
  allDrops: NavigationLinkConfig;
  summer: NavigationLinkConfig;
  winter: NavigationLinkConfig;
  preview: NavigationLinkConfig;
}

export interface CraftsmanshipConfig {
  visible: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  tailoring: {
    visible: boolean;
    badge: string;
    metric: string;
    title: string;
    accent: string;
    description: string;
    benefitOne: string;
    benefitTwo: string;
  };
  summerFeature: {
    visible: boolean;
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    description: string;
  };
  winterFeature: {
    visible: boolean;
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    description: string;
  };
  preview: {
    visible: boolean;
    badge: string;
    status: string;
    title: string;
    accent: string;
    description: string;
    assurance: string;
    buttonText: string;
  };
}

export interface PaymentMethodsConfig {
  cod: {
    enabled: boolean;
    title: string;
    instructions: string;
  };
  pay_at_studio: {
    enabled: boolean;
    title: string;
    address: string;
  };
  bank_transfer: {
    enabled: boolean;
    title: string;
    bankName: string;
    accountTitle: string;
    iban: string;
  };
  jazzcash: {
    enabled: boolean;
    title: string;
    accountNumber: string;
    accountTitle: string;
  };
  easypaisa: {
    enabled: boolean;
    title: string;
    accountNumber: string;
    accountTitle: string;
  };
  nayapay_sadapay: {
    enabled: boolean;
    title: string;
    handle: string;
  };
  card: {
    enabled: boolean;
    title: string;
    note: string;
  };
}

export interface SocialConfig {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
}

export interface FooterConfig {
  brandBio: string;
  studioAddress: string;
  phone: string;
  email: string;
  timings: string;
  copyrightText: string;
  noticeBanner: string;
}

export interface SiteConfig {
  brandName: string;
  homeScreen: HomeScreenConfig;
  categories: CategoriesConfig;
  navigation: NavigationConfig;
  craftsmanship: CraftsmanshipConfig;
  paymentMethods: PaymentMethodsConfig;
  social: SocialConfig;
  footer: FooterConfig;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: 'Zavraan',
  homeScreen: {
    announcementBadge: 'Haute Ladies Unstitched Atelier · Pure Raw Yardage',
    headlinePart1: 'The Art of Pure',
    headlinePart2: 'Unstitched Fabric.',
    subheadline:
      'Zavraan exclusively curates luxury unstitched clothes for women. Experience airy combed swiss lawns & fine cottons for summer, and rich slub khaddar & cozy brushed dhanak for winter — ready to be tailored to your silhouette.',
    primaryButtonText: 'Explore Collection',
    secondaryButtonText: 'Book Fabric Preview',
    previewNotice:
      'Preview fabrics at our atelier or via live video call before placing your order.',
    stat1Value: '3.10M+',
    stat1Label: 'Generous Cut',
    stat2Value: '100%',
    stat2Label: 'Ladies Unstitched',
    stat3Value: 'COD & Pay',
    stat3Label: 'All Payment Modes',
  },
  categories: {
    summerCollectionTitle: 'Summer Lawn & Cotton Collection',
    summerCollectionSubtitle:
      'Combed 80s Swiss lawns, designer replicas, and breathable embroidered cottons.',
    summerCategories: [
      'Lawn Printed Suits',
      'Lawn Replica',
      'Lawn Embroidery Suits',
      'Lawn Plain Fabric',
      'Cotton Plain Fabric',
      'Cotton Embroidery',
    ],
    winterCollectionTitle: 'Winter Khaddar & Dhanak Collection',
    winterCollectionSubtitle:
      'Heavy slub khaddar, cozy double-brushed dhanak, and resham thread embroideries.',
    winterCategories: [
      'Khaddar Unstitch Printed Suit',
      'Dhanak Unstitch Printed Suits',
      'Khaddar Embroidery',
      'Dhanak Embroidery',
    ],
  },
  navigation: {
    allDrops: { visible: true, label: 'All Drops' },
    summer: { visible: true, label: 'Summer Lawn & Cotton' },
    winter: { visible: true, label: 'Winter Khaddar & Dhanak' },
    preview: { visible: true, label: 'Live Video Preview' },
  },
  craftsmanship: {
    visible: true,
    eyebrow: 'The Raw Yardage Advantage // Drop 2026',
    title: 'Why Gen-Z Chooses Raw Fabric',
    titleAccent: 'Over Fast Fashion.',
    description:
      'Standard ready-made clothes force you into generic S/M/L cuts that compromise on sleeve length, flare, and neckline. Pure unstitched yardage gives you full creative agency to tailor your fit.',
    tailoring: {
      visible: true,
      badge: '01 // Total Silhouette Freedom',
      metric: '8.10M Cut',
      title: 'No Pre-Stitched Compromises.',
      accent: 'Cut It Oversized, Straight, or Flared.',
      description:
        'Every Zavraan unstitched suit comes with a generous raw cut: 3.10M+ shirt fabric, 2.50M trouser yardage, and a 2.50M dupatta. Whether you want deep drop-shoulder sleeves, breezy kalidar panels, or minimal cigarette cuts, your tailor never runs short of fabric.',
      benefitOne: '3.10M+ Generous Shirt Cut',
      benefitTwo: 'Zero Sizing Chart Drama',
    },
    summerFeature: {
      visible: true,
      image: LAWN_PRINTS_IMAGE,
      imageAlt: 'Airjet combed summer lawn fabric weave',
      eyebrow: 'SUMMER VAULT · 80s WEAVE',
      title: 'Airjet Combed Swiss Lawn',
      description:
        'Super breathable long-staple cotton woven on precision airjet looms. Featherlight drape, high-definition botanical prints, and zero color bleeding.',
    },
    winterFeature: {
      visible: true,
      image: DHANAK_KHADDAR_IMAGE,
      imageAlt: 'Double brushed winter dhanak and heavy slub khaddar',
      eyebrow: 'WINTER EDIT · COZY HEAVY YARNS',
      title: 'Slub Khaddar & Brushed Dhanak',
      description:
        'Heavy textured slub weaves and peach-brushed surfaces engineered for natural cold-weather insulation without feeling stiff or itchy.',
    },
    preview: {
      visible: true,
      badge: '02 // Authentic Transparency',
      status: 'Live Preview Available',
      title: 'No Blind Orders.',
      accent: 'Inspect the Raw Weave on Video.',
      description:
        'We believe in zero filter gimmicks. Book a free 5-minute video call with our fabric masters to examine the drape, inspect resham embroidery under daylight, or check the thickness of the chiffon dupatta before paying.',
      assurance: '100% Colorfast Reactive Dyes Tested',
      buttonText: 'Book Free Video Preview',
    },
  },
  paymentMethods: {
    cod: {
      enabled: true,
      title: 'Cash on Delivery',
      instructions: 'Pay cash upon delivery to the courier rider nationwide.',
    },
    pay_at_studio: {
      enabled: true,
      title: 'Pay at Studio (Self Pickup)',
      address: 'Zavraan Luxury Studio, Plot 14-C, Gulberg III, Lahore, Pakistan',
    },
    bank_transfer: {
      enabled: true,
      title: 'Direct Bank Transfer / Wire',
      bankName: 'Meezan Bank Ltd (Official Atelier Account)',
      accountTitle: 'Zavraan Luxury Textiles',
      iban: 'PK62MEZN0001040105829101',
    },
    jazzcash: {
      enabled: true,
      title: 'JazzCash Mobile Account',
      accountNumber: '0300-8472911',
      accountTitle: 'Zavraan Fabrics',
    },
    easypaisa: {
      enabled: true,
      title: 'Easypaisa Mobile Account',
      accountNumber: '0345-8472911',
      accountTitle: 'Zavraan Fabrics',
    },
    nayapay_sadapay: {
      enabled: true,
      title: 'SadaPay / NayaPay',
      handle: '@zavraan.official',
    },
    card: {
      enabled: true,
      title: 'Debit / Credit Card',
      note: 'Visa, Mastercard, UnionPay, PayPak',
    },
  },
  social: {
    whatsappNumber: '923008472911',
    whatsappDefaultMessage:
      'Hello Zavraan Atelier! I am inquiring about your ladies unstitched collection (Lawn / Khaddar / Dhanak).',
    instagramUrl: 'https://instagram.com/zavraan.official',
    facebookUrl: 'https://facebook.com/zavraan.official',
    tiktokUrl: 'https://tiktok.com/@zavraan.official',
  },
  footer: {
    brandBio:
      'Haute ladies unstitched atelier celebrating authentic Pakistani combed lawn, designer replicas, heavy schiffli embroideries, slub khaddar, and cozy dhanak fabrics.',
    studioAddress: 'Plot 14-C, Gulberg III, Lahore, Pakistan',
    phone: '+92 300 8472911',
    email: 'concierge@zavraan.com',
    timings: 'Monday - Saturday: 11:00 AM - 9:00 PM PKT',
    copyrightText: 'Zavraan Ladies Unstitched Haute Couture. All rights reserved.',
    noticeBanner: 'Online Digital Wallets & Offline COD · Studio Fabric Preview Appointments · Made in Pakistan',
  },
};

export const mergeSiteConfig = (config: Partial<SiteConfig>): SiteConfig => ({
  ...DEFAULT_SITE_CONFIG,
  ...config,
  brandName: config.brandName?.trim() || DEFAULT_SITE_CONFIG.brandName,
  homeScreen: { ...DEFAULT_SITE_CONFIG.homeScreen, ...config.homeScreen },
  categories: { ...DEFAULT_SITE_CONFIG.categories, ...config.categories },
  navigation: {
    ...DEFAULT_SITE_CONFIG.navigation,
    ...config.navigation,
    allDrops: { ...DEFAULT_SITE_CONFIG.navigation.allDrops, ...config.navigation?.allDrops },
    summer: { ...DEFAULT_SITE_CONFIG.navigation.summer, ...config.navigation?.summer },
    winter: { ...DEFAULT_SITE_CONFIG.navigation.winter, ...config.navigation?.winter },
    preview: { ...DEFAULT_SITE_CONFIG.navigation.preview, ...config.navigation?.preview },
  },
  craftsmanship: {
    ...DEFAULT_SITE_CONFIG.craftsmanship,
    ...config.craftsmanship,
    tailoring: {
      ...DEFAULT_SITE_CONFIG.craftsmanship.tailoring,
      ...config.craftsmanship?.tailoring,
    },
    summerFeature: {
      ...DEFAULT_SITE_CONFIG.craftsmanship.summerFeature,
      ...config.craftsmanship?.summerFeature,
    },
    winterFeature: {
      ...DEFAULT_SITE_CONFIG.craftsmanship.winterFeature,
      ...config.craftsmanship?.winterFeature,
    },
    preview: {
      ...DEFAULT_SITE_CONFIG.craftsmanship.preview,
      ...config.craftsmanship?.preview,
    },
  },
  paymentMethods: {
    ...DEFAULT_SITE_CONFIG.paymentMethods,
    ...config.paymentMethods,
    cod: { ...DEFAULT_SITE_CONFIG.paymentMethods.cod, ...config.paymentMethods?.cod },
    pay_at_studio: {
      ...DEFAULT_SITE_CONFIG.paymentMethods.pay_at_studio,
      ...config.paymentMethods?.pay_at_studio,
    },
    bank_transfer: {
      ...DEFAULT_SITE_CONFIG.paymentMethods.bank_transfer,
      ...config.paymentMethods?.bank_transfer,
    },
    jazzcash: { ...DEFAULT_SITE_CONFIG.paymentMethods.jazzcash, ...config.paymentMethods?.jazzcash },
    easypaisa: { ...DEFAULT_SITE_CONFIG.paymentMethods.easypaisa, ...config.paymentMethods?.easypaisa },
    nayapay_sadapay: {
      ...DEFAULT_SITE_CONFIG.paymentMethods.nayapay_sadapay,
      ...config.paymentMethods?.nayapay_sadapay,
    },
    card: { ...DEFAULT_SITE_CONFIG.paymentMethods.card, ...config.paymentMethods?.card },
  },
  social: { ...DEFAULT_SITE_CONFIG.social, ...config.social },
  footer: { ...DEFAULT_SITE_CONFIG.footer, ...config.footer },
});
