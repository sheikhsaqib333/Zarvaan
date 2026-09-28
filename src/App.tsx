import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Season,
  Product,
  Currency,
  CartItem,
  StitchingOption,
  StandardSize,
  CustomMeasurements,
  ProductReview,
  PreviewAppointment,
  LadiesUnstitchedCategory,
} from './types/clothing';
import {
  SiteConfig,
  DEFAULT_SITE_CONFIG,
} from './types/siteConfig';
import {
  PRODUCTS,
  INITIAL_REVIEWS,
  FABRIC_CARE_TIPS,
} from './data/products';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AppointmentModal } from './components/AppointmentModal';
import { FabricCalculatorModal } from './components/FabricCalculatorModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { CraftsmanshipSection } from './components/CraftsmanshipSection';
import { Footer } from './components/Footer';
import { FloatingSocialConcierge } from './components/FloatingSocialConcierge';
import { AdminPortal } from './components/AdminPortal';
import { Sun, CloudSnow, Check, SlidersHorizontal, Calendar } from 'lucide-react';

export default function App() {
  // Navigation & Seasonal Filter States
  const [activeSeason, setActiveSeason] = useState<Season | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<Currency>('PKR');

  // Master Site Configuration (Managed exclusively via separate Admin Portal)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('zavraan_site_config');
      return saved ? JSON.parse(saved) : DEFAULT_SITE_CONFIG;
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_site_config', JSON.stringify(siteConfig));
    } catch (e) {
      console.error(e);
    }
  }, [siteConfig]);

  // Catalog Products State (Can be created/updated/deleted via Admin Portal)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('zavraan_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Separate Admin Portal Activation Gate (?portal=admin or ?admin=true or Ctrl+Shift+A)
  const [isAdminPortalActive, setIsAdminPortalActive] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        urlParams.get('portal') === 'admin' ||
        urlParams.get('admin') === 'true' ||
        window.location.pathname === '/admin'
      );
    } catch {
      return false;
    }
  });

  // Secret keyboard listener for store owners: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminPortalActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals & Drawers
  const [activeProductForDetail, setActiveProductForDetail] = useState<Product | null>(null);
  const [productForAppointment, setProductForAppointment] = useState<Product | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromo, setCheckoutPromo] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);

  // Reviews state with persistence
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem('zavraan_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews]);

  // Appointments state with persistence
  const [appointments, setAppointments] = useState<PreviewAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('zavraan_appointments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.error(e);
    }
  }, [appointments]);

  // Cart state with persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zavraan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Wishlist state with persistence
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zavraan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zavraan_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === 'PKR' ? 'USD' : 'PKR'));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from saved wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const handleAddReview = (newRevData: Omit<ProductReview, 'id' | 'date'>) => {
    const newRev: ProductReview = {
      ...newRevData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setReviews((prev) => [newRev, ...prev]);
    showToast('Your verified review was submitted!');
  };

  const handleAddToCart = (
    product: Product,
    stitchingOption: StitchingOption = 'unstitched',
    selectedSize?: StandardSize,
    customMeasurements?: CustomMeasurements
  ) => {
    const stitchingFeePKR = stitchingOption === 'stitched' ? 3500 : 0;
    const stitchingFeeUSD = stitchingOption === 'stitched' ? 22 : 0;

    const itemPricePKR = product.pricePKR + stitchingFeePKR;
    const itemPriceUSD = product.priceUSD + stitchingFeeUSD;

    const cartItemId = `${product.id}-${stitchingOption}-${selectedSize || 'raw'}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          quantity: 1,
          stitchingOption,
          selectedSize,
          customMeasurements,
          itemPricePKR,
          itemPriceUSD,
        },
      ];
    });

    showToast(
      stitchingOption === 'stitched'
        ? `Added ${product.name} (Stitched) to Cart`
        : `Added ${product.name} (Unstitched) to Cart`
    );
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from cart');
  };

  const handleOpenCheckout = (discountAmount: number, promo: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutPromo(promo);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  const handleBookAppointment = (appt: PreviewAppointment) => {
    setAppointments((prev) => [appt, ...prev]);
    showToast(`Fabric preview appointment ${appt.id} confirmed!`);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Products with live average ratings from state
  const productsWithLiveRatings = useMemo(() => {
    return products.map((prod) => {
      const prodRevs = reviews.filter((r) => r.productId === prod.id);
      if (prodRevs.length === 0) {
        return prod;
      }
      const avg = prodRevs.reduce((acc, curr) => acc + curr.rating, 0) / prodRevs.length;
      return {
        ...prod,
        averageRating: Number(avg.toFixed(1)),
        totalReviews: prodRevs.length,
      };
    });
  }, [products, reviews]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return productsWithLiveRatings
      .filter((item) => {
        if (activeSeason !== 'all' && item.season !== activeSeason) {
          return false;
        }
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesCategory = item.category.toLowerCase().includes(q);
          const matchesFabric = item.fabricDetails?.shirt?.toLowerCase().includes(q);
          const matchesColor = item.colorName?.toLowerCase().includes(q);
          return matchesName || matchesCategory || matchesFabric || matchesColor;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return currency === 'PKR' ? a.pricePKR - b.pricePKR : a.priceUSD - b.priceUSD;
        }
        if (sortBy === 'price-desc') {
          return currency === 'PKR' ? b.pricePKR - a.pricePKR : b.priceUSD - a.priceUSD;
        }
        return 0;
      });
  }, [productsWithLiveRatings, activeSeason, selectedCategory, searchQuery, sortBy, currency]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // ================= TOTALLY SEPARATE ADMIN PORTAL VIEW =================
  if (isAdminPortalActive) {
    return (
      <AdminPortal
        siteConfig={siteConfig}
        onUpdateSiteConfig={(newConfig) => {
          setSiteConfig(newConfig);
        }}
        products={products}
        onUpdateProducts={(newProds) => {
          setProducts(newProds);
        }}
        appointments={appointments}
        reviews={reviews}
        onDeleteReview={(revId) => {
          setReviews((prev) => prev.filter((r) => r.id !== revId));
        }}
        onExitAdmin={() => {
          setIsAdminPortalActive(false);
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('portal');
            url.searchParams.delete('admin');
            window.history.replaceState({}, '', url.toString());
          } catch (e) {
            console.error(e);
          }
        }}
      />
    );
  }

  // ================= CLEAN LUXURY CUSTOMER STOREFRONT =================
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex items-center gap-2 border border-stone-700 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation (Clean customer UI with NO admin buttons) */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectSeason={(s) => {
          setActiveSeason(s);
          setSelectedCategory('all');
        }}
        activeSeason={activeSeason}
        onOpenAppointment={() => {
          setProductForAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Campaign Hero (Configured dynamically by Admin with Interactive Category Slideshow) */}
      <Hero
        onSelectSeason={(s) => {
          setActiveSeason(s);
          setSelectedCategory('all');
        }}
        onSelectCategory={(category, season) => {
          if (season) setActiveSeason(season);
          setSelectedCategory(category);
          scrollToCatalog();
        }}
        activeSeason={activeSeason}
        onScrollToCatalog={scrollToCatalog}
        onOpenAppointment={() => {
          setProductForAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
        homeConfig={siteConfig.homeScreen}
        products={products}
      />

      {/* Product Catalog Section */}
      <section ref={catalogRef} className="py-12 sm:py-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Curated Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber-900 font-bold mb-1.5">
              <span>Drop 2026 Archive</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeSeason === 'summer'
                  ? 'Summer Lawn & Cotton'
                  : activeSeason === 'winter'
                  ? 'Winter Khaddar & Dhanak'
                  : 'All Ladies Unstitched'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
              {activeSeason === 'summer'
                ? siteConfig.categories.summerCollectionTitle
                : activeSeason === 'winter'
                ? siteConfig.categories.winterCollectionTitle
                : 'Curated Unstitched Drops'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl font-light">
              {activeSeason === 'summer'
                ? siteConfig.categories.summerCollectionSubtitle
                : activeSeason === 'winter'
                ? siteConfig.categories.winterCollectionSubtitle
                : '100% pure 3-piece unstitched fabric sets. Pure combed lawns, master replicas, slub khaddar & plush dhanak.'}
            </p>
          </div>

          {/* Quick Schedule Preview & Sort Controls (Modern Pill Controls) */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => {
                setProductForAppointment(null);
                setIsAppointmentModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-100/90 border border-amber-300/80 hover:bg-amber-200/80 text-amber-950 font-bold rounded-full flex items-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>Book Fabric Preview</span>
            </button>

            <div className="flex items-center gap-2 bg-white border border-stone-300 px-3.5 py-2 rounded-full shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <label htmlFor="sort-select" className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-stone-900 focus:outline-none cursor-pointer font-bold"
              >
                <option value="featured">Featured Drops</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Season Segmented Control (Aesthetic Gen-Z Pill Switcher) */}
        <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200">
          <div className="inline-flex p-1.5 bg-stone-200/80 rounded-full self-start flex-wrap gap-1">
            <button
              onClick={() => {
                setActiveSeason('all');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold cursor-pointer transition-all rounded-full ${
                activeSeason === 'all'
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              All Drops ({productsWithLiveRatings.length})
            </button>
            <button
              onClick={() => {
                setActiveSeason('summer');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold cursor-pointer transition-all rounded-full flex items-center gap-1.5 ${
                activeSeason === 'summer'
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Summer Lawn & Cotton ({productsWithLiveRatings.filter((p) => p.season === 'summer').length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSeason('winter');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold cursor-pointer transition-all rounded-full flex items-center gap-1.5 ${
                activeSeason === 'winter'
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <CloudSnow className="w-3.5 h-3.5 text-sky-400" />
              <span>Winter Khaddar & Dhanak ({productsWithLiveRatings.filter((p) => p.season === 'winter').length})</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 font-mono">
            Showing <strong className="text-stone-950 font-bold">{filteredProducts.length}</strong> raw yardage sets
          </div>
        </div>

        {/* Contextual Subcategory Navigation (Aesthetic Gen-Z Pill Chips) */}
        <div className="py-4">
          {activeSeason === 'summer' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Summer Fabric Drops:
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Reset to All Summer Drops
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                  }`}
                >
                  All Summer Fabrics ({productsWithLiveRatings.filter((p) => p.season === 'summer').length})
                </button>
                {siteConfig.categories.summerCategories.map((cat) => {
                  const count = productsWithLiveRatings.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all flex items-center gap-2 ${
                        selectedCategory === cat
                          ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeSeason === 'winter' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Winter Fabric Drops:
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Reset to All Winter Drops
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                  }`}
                >
                  All Winter Fabrics ({productsWithLiveRatings.filter((p) => p.season === 'winter').length})
                </button>
                {siteConfig.categories.winterCategories.map((cat) => {
                  const count = productsWithLiveRatings.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all flex items-center gap-2 ${
                        selectedCategory === cat
                          ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeSeason === 'all' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100/80 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Filter by Specific Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-stone-300 px-3.5 py-1.5 text-xs text-stone-900 font-bold rounded-full focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">All Subcategories ({productsWithLiveRatings.length})</option>
                  <optgroup label="Summer Fabrics">
                    {siteConfig.categories.summerCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({productsWithLiveRatings.filter((p) => p.category === cat).length})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Winter Fabrics">
                    {siteConfig.categories.winterCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({productsWithLiveRatings.filter((p) => p.category === cat).length})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-amber-900 font-semibold hover:underline cursor-pointer"
                >
                  Clear category filter ({selectedCategory})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Filter Indicator */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 flex items-center gap-2 text-xs">
            <span className="text-stone-500">Filtered by:</span>
            <span className="bg-amber-100 text-amber-900 font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span>{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className="hover:text-stone-900 font-bold ml-1 cursor-pointer"
                aria-label="Remove filter"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-stone-200 p-8 rounded-xs">
            <p className="text-stone-500 text-base font-light">
              No ladies unstitched sets found matching your criteria.
            </p>
            <button
              onClick={() => {
                setActiveSeason('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-stone-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={setActiveProductForDetail}
                onAddToCart={(prod) => handleAddToCart(prod, 'unstitched')}
                onSchedulePreview={(prod) => {
                  setProductForAppointment(prod);
                  setIsAppointmentModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Craftsmanship & Authenticity Section */}
      <CraftsmanshipSection onOpenAppointment={() => setIsAppointmentModalOpen(true)} />

      {/* Customer Footer (Admin buttons removed, completely dynamic) */}
      <Footer
        onSelectSeason={(season) => {
          setActiveSeason(season);
          setSelectedCategory('all');
          scrollToCatalog();
        }}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenAppointment={() => {
          setProductForAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
        instagramUrl={siteConfig.social.instagramUrl}
        footerConfig={siteConfig.footer}
        categoriesConfig={siteConfig.categories}
      />

      {/* Floating WhatsApp and Instagram Social Concierge (Direct user links, no admin triggers) */}
      <FloatingSocialConcierge
        whatsappNumber={siteConfig.social.whatsappNumber}
        defaultMessage={siteConfig.social.whatsappDefaultMessage}
        instagramUrl={siteConfig.social.instagramUrl}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProductForDetail}
        currency={currency}
        isOpen={!!activeProductForDetail}
        onClose={() => setActiveProductForDetail(null)}
        isWishlisted={activeProductForDetail ? wishlistIds.includes(activeProductForDetail.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onOpenCalculator={() => {
          setActiveProductForDetail(null);
          setIsCalculatorOpen(true);
        }}
        onSchedulePreview={(prod) => {
          setProductForAppointment(prod);
          setIsAppointmentModalOpen(true);
        }}
        reviews={reviews}
        onAddReview={handleAddReview}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setProductForAppointment(null);
        }}
        preselectedProduct={productForAppointment}
        allProducts={productsWithLiveRatings}
        onBookAppointment={handleBookAppointment}
        paymentConfig={siteConfig.paymentMethods}
        currency={currency}
      />

      <FabricCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        discount={checkoutDiscount}
        promoCode={checkoutPromo}
        onOrderCompleted={handleOrderCompleted}
        paymentConfig={siteConfig.paymentMethods}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProductIds={wishlistIds}
        allProducts={productsWithLiveRatings}
        currency={currency}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={setActiveProductForDetail}
        onAddToCart={(prod) => handleAddToCart(prod, 'unstitched')}
      />
    </div>
  );
}
