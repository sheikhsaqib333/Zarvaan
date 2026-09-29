import React, { useState } from 'react';
import { Product, Currency, StandardSize, CustomMeasurements, StitchingOption, ProductReview } from '../types/clothing';
import { ReviewSystem } from './ReviewSystem';
import { X, Check, Ruler, Scissors, Shield, Heart, ShoppingCart, ZoomIn, Calendar, Star, ThumbsUp } from 'lucide-react';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';
import { PRODUCT_TAG_LABELS, PRODUCT_TAG_STYLES } from '../utils/productTags';

interface ProductDetailModalProps {
  product: Product | null;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  likeCount: number;
  isLiked: boolean;
  onToggleWishlist: (productId: string) => void;
  onToggleLike: (productId: string) => void;
  onAddToCart: (
    product: Product,
    stitchingOption: StitchingOption,
    selectedSize?: StandardSize,
    customMeasurements?: CustomMeasurements
  ) => void;
  onOpenCalculator: () => void;
  onSchedulePreview: (product: Product) => void;
  reviews: ProductReview[];
  onAddReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isOpen,
  onClose,
  isWishlisted,
  likeCount,
  isLiked,
  onToggleWishlist,
  onToggleLike,
  onAddToCart,
  onOpenCalculator,
  onSchedulePreview,
  reviews,
  onAddReview,
}) => {
  const brandName = useBrandName();
  const displayBrand = (text: string) => replaceBrandName(text, brandName);
  const [activeImageTab, setActiveImageTab] = useState<'primary' | 'secondary' | 'macro'>('primary');
  const [stitchingOption, setStitchingOption] = useState<StitchingOption>('unstitched');
  const [selectedSize, setSelectedSize] = useState<StandardSize>('M');
  const [showMeasurementsForm, setShowMeasurementsForm] = useState(false);
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    bust: '38',
    waist: '32',
    hip: '42',
    shirtLength: '42',
    trouserLength: '38',
    specialNotes: '',
  });
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'reviews'>('details');

  if (!isOpen || !product) return null;

  const stitchingFeePKR = 3500;
  const stitchingFeeUSD = 22;

  const basePrice = currency === 'PKR' ? product.pricePKR : product.priceUSD;
  const stitchingFee =
    stitchingOption === 'stitched' ? (currency === 'PKR' ? stitchingFeePKR : stitchingFeeUSD) : 0;
  const finalPrice = basePrice + stitchingFee;

  const handleAdd = () => {
    onAddToCart(
      product,
      stitchingOption,
      stitchingOption === 'stitched' ? selectedSize : undefined,
      stitchingOption === 'stitched' && selectedSize === 'Custom' ? measurements : undefined
    );
    onClose();
  };

  const currentDisplayImage =
    activeImageTab === 'primary'
      ? product.primaryImage
      : activeImageTab === 'secondary'
      ? product.secondaryImage
      : product.macroImage;

  const productReviews = reviews.filter((r) => r.productId === product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#FAF9F5] w-full max-w-4xl border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 rounded-full shadow-xs cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image & Texture Zoom Inspector */}
          <div className="md:col-span-6 bg-stone-100 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
            <div>
              {/* Primary Image Viewport */}
              <div className="relative aspect-3/4 overflow-hidden rounded-xs bg-white border border-stone-200 group">
                <img
                  src={currentDisplayImage}
                  alt={displayBrand(product.name)}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 bg-stone-900/80 text-white text-[10px] px-2 py-1 tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-xs">
                  <ZoomIn className="w-3 h-3 text-amber-300" />
                  <span>{activeImageTab === 'macro' ? 'Fabric Texture Close-Up' : 'Silhouette View'}</span>
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  onClick={() => setActiveImageTab('primary')}
                  className={`relative aspect-4/3 overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageTab === 'primary' ? 'border-amber-900' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.primaryImage} alt="Main view" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 text-center">
                    Look 1
                  </span>
                </button>

                <button
                  onClick={() => setActiveImageTab('secondary')}
                  className={`relative aspect-4/3 overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageTab === 'secondary' ? 'border-amber-900' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.secondaryImage} alt="Secondary drape view" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 text-center">
                    Editorial
                  </span>
                </button>

                <button
                  onClick={() => setActiveImageTab('macro')}
                  className={`relative aspect-4/3 overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageTab === 'macro' ? 'border-amber-900' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.macroImage} alt="Macro weave" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 text-center">
                    Fabric Texture
                  </span>
                </button>
              </div>
            </div>

            {/* Fabric Authenticity Badge */}
            <div className="mt-4 pt-4 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-mono text-stone-500">SKU: {product.sku}</span>
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Guaranteed Unstitched Yardage</span>
              </span>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Review Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating Bar */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-1">
                <span className="text-amber-900 font-semibold uppercase tracking-wider">
                  {product.season === 'summer' ? 'Summer Collection' : 'Winter Collection'} · {displayBrand(product.category)}
                </span>

                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setActiveTab('reviews')}
                    className="flex items-center gap-1 cursor-pointer hover:underline text-amber-800"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-mono font-bold text-stone-900">{product.averageRating.toFixed(1)}</span>
                    <span className="text-[11px] text-stone-500">({productReviews.length} reviews)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleLike(product.id)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${isLiked ? 'text-emerald-800' : 'text-stone-600 hover:text-emerald-800'}`}
                    aria-pressed={isLiked}
                    aria-label={isLiked ? `Unlike design; ${likeCount} likes` : `Like design; ${likeCount} likes`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount}</span>
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="flex items-center gap-1 text-stone-700 hover:text-amber-900 cursor-pointer ml-2"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-amber-900 text-amber-900' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal leading-tight">
                {displayBrand(product.name)}
              </h2>

              {(product.tags?.length || !product.inStock) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {!product.inStock && !product.tags?.includes('sold-out') && (
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-1 font-bold ${PRODUCT_TAG_STYLES['sold-out']}`}>
                      {PRODUCT_TAG_LABELS['sold-out']}
                    </span>
                  )}
                  {product.tags?.map((tag) => (
                    <span key={tag} className={`text-[9px] uppercase tracking-wider px-2 py-1 font-bold ${PRODUCT_TAG_STYLES[tag]}`}>
                      {PRODUCT_TAG_LABELS[tag]}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-mono font-semibold text-stone-900 tabular-nums">
                  {currency === 'PKR' ? `PKR ${finalPrice.toLocaleString()}` : `$${finalPrice.toFixed(2)}`}
                </span>
                {stitchingOption === 'stitched' && (
                  <span className="text-xs text-amber-900 font-medium">
                    (Includes Bespoke Stitching: {currency === 'PKR' ? `+PKR ${stitchingFeePKR.toLocaleString()}` : `+$${stitchingFeeUSD}`})
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                {displayBrand(product.description)}
              </p>

              {/* Interactive Stitching Selector */}
              <div className="mt-5 p-4 bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-800" />
                    <span>Select Format</span>
                  </span>
                  <button
                    onClick={onOpenCalculator}
                    className="text-xs text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Check Yardage Fit</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStitchingOption('unstitched')}
                    className={`p-3 text-left border cursor-pointer transition-all ${
                      stitchingOption === 'unstitched'
                        ? 'border-stone-900 bg-stone-50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900">Unstitched Fabric</span>
                      {stitchingOption === 'unstitched' && <Check className="w-3.5 h-3.5 text-stone-900" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">Full fabric cuts + embroidered motifs in gift box</p>
                  </button>

                  <button
                    onClick={() => setStitchingOption('stitched')}
                    className={`p-3 text-left border cursor-pointer transition-all ${
                      stitchingOption === 'stitched'
                        ? 'border-amber-900 bg-amber-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-950">Custom Tailored</span>
                      {stitchingOption === 'stitched' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Stitched with laces & finishing (+{currency === 'PKR' ? 'PKR 3,500' : '$22'})
                    </p>
                  </button>
                </div>

                {stitchingOption === 'stitched' && (
                  <div className="pt-3 border-t border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-stone-700">Select Size:</label>
                      <button
                        onClick={() => setShowMeasurementsForm(!showMeasurementsForm)}
                        className="text-[11px] text-amber-900 underline cursor-pointer"
                      >
                        {showMeasurementsForm ? 'Use Standard Size' : 'Provide Custom Measurements'}
                      </button>
                    </div>

                    {!showMeasurementsForm ? (
                      <div className="flex items-center gap-2">
                        {(['S', 'M', 'L', 'XL'] as StandardSize[]).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`flex-1 py-1.5 text-xs font-medium border cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-800'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 bg-[#FBF9F4] p-2.5 border border-stone-200 text-xs">
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase">Bust (in)</label>
                          <input
                            type="text"
                            value={measurements.bust}
                            onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                            className="w-full bg-white border border-stone-300 p-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase">Waist (in)</label>
                          <input
                            type="text"
                            value={measurements.waist}
                            onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                            className="w-full bg-white border border-stone-300 p-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 uppercase">Shirt L (in)</label>
                          <input
                            type="text"
                            value={measurements.shirtLength}
                            onChange={(e) => setMeasurements({ ...measurements, shirtLength: e.target.value })}
                            className="w-full bg-white border border-stone-300 p-1 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informational Tabs: Details / Care / Customer Reviews */}
              <div className="mt-5">
                <div className="flex border-b border-stone-200 text-xs">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-3 font-medium cursor-pointer ${
                      activeTab === 'details'
                        ? 'border-b-2 border-stone-900 text-stone-900'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Fabric Inclusions
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`py-2 px-3 font-medium cursor-pointer ${
                      activeTab === 'care'
                        ? 'border-b-2 border-stone-900 text-stone-900'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Washing & Shrinking Care
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-2 px-3 font-medium cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'reviews'
                        ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span>Reviews for this design ({productReviews.length})</span>
                  </button>
                </div>

                <div className="py-3 text-xs text-stone-600">
                  {activeTab === 'details' && (
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between py-1 border-b border-stone-100">
                        <span className="font-semibold text-stone-800 w-28 shrink-0">Shirt Fabric:</span>
                        <span className="text-right text-stone-600">{product.fabricDetails.shirt}</span>
                      </div>
                      <div className="flex items-start justify-between py-1 border-b border-stone-100">
                        <span className="font-semibold text-stone-800 w-28 shrink-0">Dupatta / Trouser:</span>
                        <span className="text-right text-stone-600">{product.fabricDetails.dupattaOrTrouser}</span>
                      </div>
                      <div className="flex items-start justify-between py-1 border-b border-stone-100">
                        <span className="font-semibold text-stone-800 w-28 shrink-0">Embroideries:</span>
                        <span className="text-right text-stone-600">{product.fabricDetails.embroideryPatches}</span>
                      </div>
                      <div className="flex items-start justify-between py-1 border-b border-stone-100">
                        <span className="font-semibold text-stone-800 w-28 shrink-0">Total Cut Length:</span>
                        <span className="text-right text-stone-600 font-mono">{product.fabricDetails.fabricCutMeters}</span>
                      </div>
                      <div className="flex items-start justify-between py-1">
                        <span className="font-semibold text-stone-800 w-28 shrink-0">Weave Spec:</span>
                        <span className="text-right text-stone-600">{product.fabricDetails.weaveSpec}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div className="space-y-1.5 text-stone-600">
                      <p>• Dip pure cotton lawn & khaddar in lukewarm water for 15 minutes before cutting to account for natural shrinkage.</p>
                      <p>• Do not use chemical bleach. Use mild fabric detergents for colorfast longevity.</p>
                      <p>• Dry in shade. Direct scorching sun can affect delicate resham embroideries.</p>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <ReviewSystem
                      productId={product.id}
                      productName={product.name}
                      reviews={productReviews}
                      averageRating={product.averageRating}
                      totalReviews={productReviews.length}
                      onAddReview={onAddReview}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar: Preview First vs Add to Bag */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Schedule Preview Button */}
                <button
                  onClick={() => {
                    onClose();
                    onSchedulePreview(product);
                  }}
                  className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 py-3 px-3 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-800" />
                  <span>Schedule Preview First</span>
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 px-3 text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>
                    Add to Cart · {currency === 'PKR' ? `PKR ${finalPrice.toLocaleString()}` : `$${finalPrice.toFixed(2)}`}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 text-center">
                Want to feel the fabric before buying? Tap 'Schedule Preview First' for studio visit or video call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
