import React, { useState } from 'react';
import { CartItem, Currency } from '../types/clothing';
import { X, Trash2, Plus, Minus, Scissors, ShoppingCart, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const brandName = useBrandName();
  const displayBrand = (text: string) => replaceBrandName(text, brandName);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => {
    const itemPrice = currency === 'PKR' ? item.itemPricePKR : item.itemPriceUSD;
    return sum + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = currency === 'PKR' ? 7500 : 30;
  const isFreeShipping = rawSubtotal >= freeShippingThreshold;
  const progressToFreeShipping = Math.min(100, (rawSubtotal / freeShippingThreshold) * 100);

  const discountAmount = appliedPromo ? rawSubtotal * 0.1 : 0;
  const finalSubtotal = rawSubtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim().toUpperCase() === 'ZAVRAAN10') {
      setAppliedPromo('ZAVRAAN10');
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Use ZAVRAAN10 for 10% off');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAF9F5] h-full shadow-2xl flex flex-col justify-between border-l border-stone-200">
        {/* Header - Simple and Clear Cart */}
        <div className="p-4 sm:p-6 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif text-xl text-stone-900 font-normal">Shopping Cart</h2>
            <span className="text-xs font-mono bg-stone-100 text-stone-800 px-2 py-0.5 rounded-xs">
              {items.reduce((acc, curr) => acc + curr.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-950 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-6 py-2.5 bg-[#F2EFE9] border-b border-stone-200 text-xs text-stone-700">
          <div className="flex justify-between font-medium mb-1">
            <span>
              {isFreeShipping
                ? '✨ You have unlocked Free Express Delivery!'
                : `Add ${
                    currency === 'PKR'
                      ? `PKR ${(freeShippingThreshold - rawSubtotal).toLocaleString()}`
                      : `$${(freeShippingThreshold - rawSubtotal).toFixed(2)}`
                  } more for Free Delivery`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-900 transition-all duration-500"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingCart className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif text-lg text-stone-800">Your cart is currently empty</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Select your favorite unstitched suit from our summer or winter collections.
              </p>
              <button
                onClick={onClose}
                className="mt-2 inline-block bg-stone-900 text-white text-xs uppercase tracking-wider py-2 px-5 cursor-pointer hover:bg-stone-800"
              >
                Browse Clothes
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemTotal = (currency === 'PKR' ? item.itemPricePKR : item.itemPriceUSD) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white border border-stone-200/90 rounded-xs shadow-xs"
                >
                  <img
                    src={item.product.primaryImage}
                    alt={displayBrand(item.product.name)}
                    className="w-20 h-24 object-cover rounded-xs border border-stone-200"
                  />

                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-sm font-medium text-stone-900 leading-tight">
                          {displayBrand(item.product.name)}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-700 cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1">
                        <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 border border-amber-200 font-medium">
                          {displayBrand(item.product.category)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        {item.stitchingOption === 'stitched' ? (
                          <span className="flex items-center gap-1 text-amber-900 font-semibold">
                            <Scissors className="w-3 h-3" />
                            <span>Stitched ({item.selectedSize || 'Custom'})</span>
                          </span>
                        ) : (
                          <span className="text-stone-600 font-medium">Unstitched Fabric Suit</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 bg-stone-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-950 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-xs text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-950 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-stone-900 tabular-nums">
                        {currency === 'PKR' ? `PKR ${itemTotal.toLocaleString()}` : `$${itemTotal.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-stone-200 space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Promo code: ZAVRAAN10"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-stone-300 pl-8 pr-2 py-1.5 text-xs focus:outline-stone-800 uppercase"
                />
              </div>
              <button
                type="submit"
                className="bg-stone-800 text-white px-3 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-stone-900 cursor-pointer"
              >
                Apply
              </button>
            </form>

            {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
            {appliedPromo && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ✓ Coupon '{appliedPromo}' applied (10% discount subtracted).
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {currency === 'PKR' ? `PKR ${rawSubtotal.toLocaleString()}` : `$${rawSubtotal.toFixed(2)}`}
                </span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-700">
                  <span>Launch Discount (10%)</span>
                  <span className="font-mono tabular-nums">
                    - {currency === 'PKR' ? `PKR ${discountAmount.toLocaleString()}` : `$${discountAmount.toFixed(2)}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'Complimentary' : currency === 'PKR' ? 'PKR 350' : '$8.00'}</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Payable</span>
                <span className="font-mono text-base tabular-nums">
                  {currency === 'PKR'
                    ? `PKR ${(finalSubtotal + (isFreeShipping ? 0 : 350)).toLocaleString()}`
                    : `$${(finalSubtotal + (isFreeShipping ? 0 : 8)).toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onOpenCheckout(discountAmount, appliedPromo || '');
              }}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 px-4 text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              <span>Cash on Delivery & Online Wallets Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
