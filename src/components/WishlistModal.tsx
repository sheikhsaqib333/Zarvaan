import React from 'react';
import { Product, Currency } from '../types/clothing';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProductIds: string[];
  allProducts: Product[];
  currency: Currency;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProductIds,
  allProducts,
  currency,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = allProducts.filter((p) => wishlistProductIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#FAF9F5] w-full max-w-2xl border border-stone-200 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white text-stone-600 hover:text-stone-950 rounded-full shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-900 font-semibold mb-1">
          <Heart className="w-4 h-4 fill-amber-900" />
          <span>Saved Favorites</span>
        </div>

        <h2 className="text-2xl font-serif text-stone-900 font-normal">
          Saved Unstitched Clothes ({wishlistedProducts.length})
        </h2>

        {wishlistedProducts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Heart className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-serif text-base text-stone-700">No items saved in your wishlist yet</p>
            <p className="text-xs text-stone-500">
              Click the heart icon on any unstitched suit to save it for later comparison.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 p-3 bg-white border border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-16 h-20 object-cover rounded-xs border border-stone-200 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onQuickView(product);
                    }}
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-900 font-medium">
                      {product.category}
                    </span>
                    <h4
                      className="font-serif text-sm font-medium text-stone-900 cursor-pointer hover:underline"
                      onClick={() => {
                        onClose();
                        onQuickView(product);
                      }}
                    >
                      {product.name}
                    </h4>
                    <span className="font-mono text-xs font-semibold text-stone-900 tabular-nums">
                      {currency === 'PKR' ? `PKR ${product.pricePKR.toLocaleString()}` : `$${product.priceUSD.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-medium"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="p-2 text-stone-400 hover:text-red-700 cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs uppercase tracking-wider font-medium bg-stone-900 text-white hover:bg-stone-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
