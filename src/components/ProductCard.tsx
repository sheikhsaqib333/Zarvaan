import React, { useState } from 'react';
import { Product, Currency } from '../types/clothing';
import { Heart, Eye, ShoppingCart, Star, Video } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSchedulePreview?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onSchedulePreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedPrice =
    currency === 'PKR'
      ? `PKR ${product.pricePKR.toLocaleString()}`
      : `$${product.priceUSD.toFixed(2)}`;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage (Aspect 3:4) */}
      <div
        className="relative aspect-3/4 overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Aesthetic Floating Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-20">
          <span className="text-[10px] uppercase tracking-wider text-stone-900 bg-white/90 backdrop-blur-md border border-stone-200/80 px-2.5 py-0.5 rounded-full font-semibold shadow-xs">
            {product.category}
          </span>
          {product.isNewArrival && (
            <span className="text-[9px] uppercase tracking-widest bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-bold shadow-xs">
              ✦ Drop '26
            </span>
          )}
        </div>

        {/* Wishlist Button with Heart Pop Animation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 cursor-pointer z-20 shadow-md ${
            isWishlisted
              ? 'bg-amber-900 text-white scale-110'
              : 'bg-white/85 hover:bg-white text-stone-700 hover:text-stone-950 backdrop-blur-md active:scale-90'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Hover Action Strip with Modern Pill Buttons */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white hover:bg-stone-100 text-stone-950 py-2 px-3 text-xs uppercase tracking-wider font-bold rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Fabric Details</span>
          </button>

          {onSchedulePreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSchedulePreview(product);
              }}
              className="bg-amber-800 hover:bg-amber-900 text-white p-2 rounded-full transition-all cursor-pointer shadow-md active:scale-95"
              title="Schedule live video preview before purchase"
              aria-label="Preview video"
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-stone-950 hover:bg-stone-800 text-white p-2 rounded-full transition-all cursor-pointer shadow-md active:scale-95"
            title="Add unstitched suit to cart"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information Module */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-[#FCFBF8]">
        <div>
          {/* Metadata clean unboxed row with star ratings */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-amber-950/80 font-semibold font-mono">
              {product.pieces} · 8.1M Cut
            </span>

            {/* Star Rating Display */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="font-mono text-stone-800 text-[11px] font-bold">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-stone-400">({product.totalReviews})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-base sm:text-lg text-stone-950 leading-snug line-clamp-1 hover:text-amber-800 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Fabric Highlight */}
          <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-light">
            {product.fabricDetails.shirt}
          </p>
        </div>

        {/* Price and Color Swatch Bar */}
        <div className="pt-2.5 border-t border-stone-200/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
              Price
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-stone-950 tabular-nums">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-2" title={product.colorName}>
            <span
              className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
              style={{ backgroundColor: product.colorHex }}
            />
            <span className="text-xs text-stone-600 font-medium truncate max-w-24">
              {product.colorName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
