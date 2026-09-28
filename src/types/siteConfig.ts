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
}

export interface CategoriesConfig {
  summerCollectionTitle: string;
  summerCollectionSubtitle: string;
  summerCategories: string[];
  winterCollectionTitle: string;
  winterCollectionSubtitle: string;
  winterCategories: string[];
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
  homeScreen: HomeScreenConfig;
  categories: CategoriesConfig;
  paymentMethods: PaymentMethodsConfig;
  social: SocialConfig;
  footer: FooterConfig;
  adminPasscode: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
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
  adminPasscode: 'zavraan@admin2026',
};
