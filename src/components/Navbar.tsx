import React from 'react';
import { ShoppingCart, Heart, Calendar } from 'lucide-react';
import { Currency, Season } from '../types/clothing';
import { NavigationConfig } from '../types/siteConfig';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  currency: Currency;
  onToggleCurrency: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSelectSeason: (season: Season | 'all') => void;
  activeSeason: Season | 'all';
  navigationConfig: NavigationConfig;
  onOpenAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  currency,
  onToggleCurrency,
  onOpenCart,
  onOpenWishlist,
  onSelectSeason,
  activeSeason,
  navigationConfig,
  onOpenAppointment,
}) => {
  const brandName = useBrandName();
  const hasVisibleNavigation = Object.values(navigationConfig).some((link) => link.visible);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-stone-200/70 transition-all">
      {/* Chic Top Mini Announcement Bar */}
      <div className="bg-stone-950 text-stone-300 text-[11px] py-1.5 px-4 text-center tracking-[0.2em] uppercase flex items-center justify-center gap-3">
        <span>Ladies Haute Unstitched Fabrics · Drop 2026 Archive</span>
        <span className="hidden md:inline text-stone-600">·</span>
        <span className="hidden md:inline text-amber-300 font-semibold">100% Pure Raw Yardage</span>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Actions) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectSeason('all')}
          className="text-2xl sm:text-3xl font-serif tracking-[0.22em] text-stone-950 font-semibold hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          {brandName.toUpperCase()}
        </button>

        {/* Zone 2: Navigation Links (Clean unboxed Gen-Z typography) */}
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.16em] uppercase font-semibold text-stone-600">
          {navigationConfig.allDrops.visible && (
            <button
              onClick={() => onSelectSeason('all')}
              className={`transition-colors hover:text-stone-950 cursor-pointer ${
                activeSeason === 'all'
                  ? 'text-stone-950 font-bold border-b-2 border-stone-950 pb-0.5'
                  : ''
              }`}
            >
              {replaceBrandName(navigationConfig.allDrops.label, brandName)}
            </button>
          )}
          {navigationConfig.summer.visible && (
            <button
              onClick={() => onSelectSeason('summer')}
              className={`transition-colors hover:text-stone-950 cursor-pointer ${
                activeSeason === 'summer'
                  ? 'text-stone-950 font-bold border-b-2 border-stone-950 pb-0.5'
                  : ''
              }`}
            >
              {replaceBrandName(navigationConfig.summer.label, brandName)}
            </button>
          )}
          {navigationConfig.winter.visible && (
            <button
              onClick={() => onSelectSeason('winter')}
              className={`transition-colors hover:text-stone-950 cursor-pointer ${
                activeSeason === 'winter'
                  ? 'text-stone-950 font-bold border-b-2 border-stone-950 pb-0.5'
                  : ''
              }`}
            >
              {replaceBrandName(navigationConfig.winter.label, brandName)}
            </button>
          )}
          {navigationConfig.preview.visible && (
            <button
              onClick={onOpenAppointment}
              className="transition-colors hover:text-stone-950 cursor-pointer text-amber-900 font-bold flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>{replaceBrandName(navigationConfig.preview.label, brandName)}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Modern Pill Controls) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Currency Switcher Pill */}
          <button
            onClick={onToggleCurrency}
            className="text-xs font-mono font-bold px-3 py-1.5 border border-stone-300 rounded-full hover:border-stone-950 transition-colors text-stone-800 cursor-pointer bg-white/70 active:scale-95 shadow-2xs"
            title="Toggle currency PKR / USD"
          >
            {currency}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-full text-stone-700 hover:text-stone-950 hover:bg-stone-200/50 transition-all cursor-pointer active:scale-90"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-900 text-white text-[10px] rounded-full flex items-center justify-center font-mono font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer rounded-full shadow-sm hover:shadow-md active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Bag</span>
            <span className="font-mono text-xs bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {hasVisibleNavigation && (
        <div className="md:hidden flex items-center justify-around border-t border-stone-200/70 py-2.5 text-[11px] uppercase tracking-wider text-stone-700 px-3 bg-[#FAF9F5]">
          {navigationConfig.allDrops.visible && <button
          onClick={() => onSelectSeason('all')}
          className={`py-1 px-2 rounded-full cursor-pointer ${
            activeSeason === 'all'
              ? 'font-bold bg-stone-950 text-white'
              : 'text-stone-600'
          }`}
        >
          {replaceBrandName(navigationConfig.allDrops.label, brandName)}
        </button>}
        {navigationConfig.summer.visible && <button
          onClick={() => onSelectSeason('summer')}
          className={`py-1 px-2 rounded-full cursor-pointer ${
            activeSeason === 'summer'
              ? 'font-bold bg-stone-950 text-white'
              : 'text-stone-600'
          }`}
        >
          {replaceBrandName(navigationConfig.summer.label, brandName)}
        </button>}
        {navigationConfig.winter.visible && <button
          onClick={() => onSelectSeason('winter')}
          className={`py-1 px-2 rounded-full cursor-pointer ${
            activeSeason === 'winter'
              ? 'font-bold bg-stone-950 text-white'
              : 'text-stone-600'
          }`}
        >
          {replaceBrandName(navigationConfig.winter.label, brandName)}
        </button>}
        {navigationConfig.preview.visible && <button
          onClick={onOpenAppointment}
          className="py-1 px-2 text-amber-900 font-bold cursor-pointer"
        >
          {replaceBrandName(navigationConfig.preview.label, brandName)}
        </button>}
        </div>
      )}
    </header>
  );
};
