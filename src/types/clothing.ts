export type Season = 'summer' | 'winter';

export type SummerCategory =
  | 'Lawn Printed Suits'
  | 'Lawn Replica'
  | 'Lawn Embroidery Suits'
  | 'Lawn Plain Fabric'
  | 'Cotton Plain Fabric'
  | 'Cotton Embroidery';

export type WinterCategory =
  | 'Khaddar Unstitch Printed Suit'
  | 'Dhanak Unstitch Printed Suits'
  | 'Khaddar Embroidery'
  | 'Dhanak Embroidery';

export type LadiesUnstitchedCategory = SummerCategory | WinterCategory;

export type PieceType = '3-Piece Suit' | '2-Piece Suit' | 'Plain Fabric (Per Yard/Meter)';
export type StitchingOption = 'unstitched' | 'stitched';
export type StandardSize = 'S' | 'M' | 'L' | 'XL' | 'Custom';
export type Currency = 'PKR' | 'USD';

export type PaymentMethod =
  // Offline
  | 'cod'
  | 'pay_at_studio'
  | 'bank_transfer'
  // Online
  | 'jazzcash'
  | 'easypaisa'
  | 'nayapay_sadapay'
  | 'card';

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  fabricFeedback?: {
    softness: string;
    colorFastness: string;
    shrinkingTested: string;
  };
}

export interface FabricBreakdown {
  shirt: string;
  dupattaOrTrouser: string;
  trouser: string;
  embroideryPatches: string;
  fabricCutMeters: string;
  weightGrams: number;
  weaveSpec: string;
}

export interface CustomMeasurements {
  bust: string;
  waist: string;
  hip: string;
  shirtLength: string;
  trouserLength: string;
  specialNotes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  season: Season;
  category: LadiesUnstitchedCategory;
  pieces: PieceType;
  pricePKR: number;
  priceUSD: number;
  primaryImage: string;
  secondaryImage: string;
  macroImage: string;
  fabricDetails: FabricBreakdown;
  colorName: string;
  colorHex: string;
  description: string;
  stylingTips: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  inStock: boolean;
  averageRating: number;
  totalReviews: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  stitchingOption: StitchingOption;
  selectedSize?: StandardSize;
  customMeasurements?: CustomMeasurements;
  itemPricePKR: number;
  itemPriceUSD: number;
}

export interface PreviewAppointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  appointmentType: 'in_person_atelier' | 'virtual_video_preview';
  date: string;
  timeSlot: string;
  productIds: string[];
  productNames: string[];
  specialRequest?: string;
  bookedAt: string;
  status: 'Confirmed & Scheduled';
  feePKR: number;
  feeUSD: number;
  paymentStatus: 'free' | 'paid' | 'pending_verification';
  paymentMethod?: 'bank_transfer' | 'easypaisa' | 'jazzcash';
  senderAccount?: string;
  senderBankName?: string;
  transactionId?: string;
  paymentProofName?: string;
  paymentDate?: string;
}

export interface OrderConfirmation {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: Currency;
  orderDate: string;
}
