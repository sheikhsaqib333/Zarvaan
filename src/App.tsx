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
} from './types/clothing';
import { SiteConfig, DEFAULT_SITE_CONFIG, mergeSiteConfig } from './types/siteConfig';
import { PRODUCTS, INITIAL_REVIEWS } from './data/products';
import { storeApi } from './lib/storeApi';
import { usePersistentState } from './utils/storage';
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
import { AdminPortal } from './admin/AdminPortal';
import { BrandNameProvider, replaceBrandName } from './context/BrandNameContext';
import { Sun, CloudSnow, Check, SlidersHorizontal, Calendar } from 'lucide-react';

export default function App() {
  const [activeSeason, setActiveSeason] = useState<Season | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<Currency>('PKR');

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [appointments, setAppointments] = useState<PreviewAppointment[]>([]);
  const [cartItems, setCartItems] = usePersistentState<CartItem[]>('zavraan_cart', []);
  const [wishlistIds, setWishlistIds] = usePersistentState<string[]>('zavraan_wishlist', []);
  const [visitorId] = usePersistentState<string>(
    'zavraan_visitor_id',
    globalThis.crypto?.randomUUID?.() ?? `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [likedProductIds, setLikedProductIds] = usePersistentState<string[]>('zavraan_liked_products', []);
  const [productLikeCounts, setProductLikeCounts] = useState<Record<string, number>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [serverConfig, serverProducts, serverReviews, serverLikes] = await Promise.all([
          storeApi.getSiteConfig(),
          storeApi.getProducts(),
          storeApi.getReviews(),
          storeApi.getLikes().catch(() => ({})),
        ]);

        setSiteConfig(mergeSiteConfig(serverConfig));
        setProducts(serverProducts);
        setReviews(serverReviews);
        setProductLikeCounts(serverLikes);
      } catch (error) {
        console.error('Failed to load store data from backend:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadStoreData();
  }, []);

  useEffect(() => {
    const brandName = siteConfig.brandName.trim() || 'Zavraan';
    document.title = `${brandName} Luxury Unstitched | Summer Lawn & Winter Dhanak`;
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', document.title);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        replaceBrandName(
          'Zavraan luxury ladies unstitched designer clothing for summers and winters - fine combed lawns, cotton yardage, master designer replicas, slub khaddar, and double-brushed dhanak.',
          brandName
        )
      );
  }, [siteConfig.brandName]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        setIsAdminPortalActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [activeProductForDetail, setActiveProductForDetail] = useState<Product | null>(null);
  const [productForAppointment, setProductForAppointment] = useState<Product | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromo, setCheckoutPromo] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const displayBrand = (text: string) => replaceBrandName(text, siteConfig.brandName);

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

  const handleToggleProductLike = async (productId: string) => {
    try {
      const result = await storeApi.toggleLike(productId, visitorId);
      setProductLikeCounts((current) => ({ ...current, [productId]: result.count }));
      setLikedProductIds((current) =>
        result.liked
          ? current.includes(productId) ? current : [...current, productId]
          : current.filter((id) => id !== productId)
      );
    } catch (error) {
      console.error('Unable to update product like:', error);
      showToast('Like could not be saved. Please try again.');
    }
  };

  const handleAddReview = (newRevData: Omit<ProductReview, 'id' | 'date'>) => {
    storeApi.submitReview(newRevData)
      .then((newReview) => {
        setReviews((prev) => [newReview, ...prev]);
        showToast('Your verified review was submitted!');
      })
      .catch((error) => {
        console.error('Unable to submit review:', error);
        showToast('Review could not be submitted. Please try again.');
      });
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
    storeApi.submitAppointment(appt)
      .then((savedAppointment) => {
        setAppointments((prev) => [savedAppointment, ...prev]);
        showToast(`Fabric preview appointment ${savedAppointment.id} confirmed!`);
      })
      .catch((error) => {
        console.error('Unable to submit appointment:', error);
        showToast('Appointment could not be saved. Please try again.');
      });
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

  const persistSiteConfig = async (nextConfig: SiteConfig) => {
    setSiteConfig(nextConfig);
    await storeApi.saveSiteConfig(nextConfig);
  };

  const persistProducts = async (nextProducts: Product[]) => {
    setProducts(nextProducts);
    await storeApi.saveProducts(nextProducts);
  };

  const persistReviews = async (nextReviews: ProductReview[]) => {
    setReviews(nextReviews);
    await storeApi.saveReviews(nextReviews);
  };

  const persistAppointments = async (nextAppointments: PreviewAppointment[]) => {
    setAppointments(nextAppointments);
    await storeApi.saveAppointments(nextAppointments);
  };

  const seasonCounts = useMemo(
    () => ({
      all: productsWithLiveRatings.length,
      summer: productsWithLiveRatings.filter((product) => product.season === 'summer').length,
      winter: productsWithLiveRatings.filter((product) => product.season === 'winter').length,
    }),
    [productsWithLiveRatings]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    productsWithLiveRatings.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    });

    return counts;
  }, [productsWithLiveRatings]);

  const getCategoryCount = (category: string) => categoryCounts.get(category) ?? 0;

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      currency={currency}
      isWishlisted={wishlistIds.includes(product.id)}
      likeCount={productLikeCounts[product.id] ?? 0}
      isLiked={likedProductIds.includes(product.id)}
      onToggleWishlist={handleToggleWishlist}
      onToggleLike={handleToggleProductLike}
      onQuickView={setActiveProductForDetail}
      onAddToCart={(prod) => handleAddToCart(prod, 'unstitched')}
      onSchedulePreview={(prod) => {
        setProductForAppointment(prod);
        setIsAppointmentModalOpen(true);
      }}
    />
  );

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-stone-700">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-amber-700" />
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Loading Store Data...
          </p>
        </div>
      </div>
    );
  }

  // ================= TOTALLY SEPARATE ADMIN PORTAL VIEW =================
  if (isAdminPortalActive) {
    return (
      <BrandNameProvider brandName={siteConfig.brandName}>
        <AdminPortal
          siteConfig={siteConfig}
          onUpdateSiteConfig={persistSiteConfig}
          products={products}
          onUpdateProducts={persistProducts}
          appointments={appointments}
          reviews={reviews}
          onUpdateReviews={persistReviews}
          onUpdateAppointments={persistAppointments}
          onLoadAppointments={setAppointments}
          onDeleteReview={(revId) => {
            const nextReviews = reviews.filter((r) => r.id !== revId);
            persistReviews(nextReviews);
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
      </BrandNameProvider>
    );
  }

  // ================= CLEAN LUXURY CUSTOMER STOREFRONT =================
  return (
    <BrandNameProvider brandName={siteConfig.brandName}>
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
        navigationConfig={siteConfig.navigation}
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

      {siteConfig.homepageCollections.filter((collection) => collection.visible).map((collection) => {
        const collectionProducts = collection.productIds
          .map((id) => productsWithLiveRatings.find((product) => product.id === id))
          .filter((product): product is Product => Boolean(product));
        if (!collectionProducts.length) return null;

        return (
          <section key={collection.id} className="w-full border-b border-stone-200 bg-white py-10 sm:py-14">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-amber-900">Curated collection</span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-serif text-stone-950">{displayBrand(collection.title)}</h2>
                  {collection.subtitle && <p className="mt-1 text-xs sm:text-sm text-stone-600">{displayBrand(collection.subtitle)}</p>}
                </div>
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="text-xs font-semibold text-stone-700 hover:text-amber-900 underline underline-offset-4 self-start sm:self-auto"
                >
                  Explore all designs
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {collectionProducts.map(renderProductCard)}
              </div>
            </div>
          </section>
        );
      })}

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
                ? displayBrand(siteConfig.categories.summerCollectionTitle)
                : activeSeason === 'winter'
                ? displayBrand(siteConfig.categories.winterCollectionTitle)
                : 'Curated Unstitched Drops'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl font-light">
              {activeSeason === 'summer'
                ? displayBrand(siteConfig.categories.summerCollectionSubtitle)
                : activeSeason === 'winter'
                ? displayBrand(siteConfig.categories.winterCollectionSubtitle)
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
              All Drops ({seasonCounts.all})
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
              <span>Summer Lawn & Cotton ({seasonCounts.summer})</span>
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
              <span>Winter Khaddar & Dhanak ({seasonCounts.winter})</span>
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
                  All Summer Fabrics ({seasonCounts.summer})
                </button>
                {siteConfig.categories.summerCategories.map((cat) => {
                  const count = getCategoryCount(cat);
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
                      <span>{displayBrand(cat)}</span>
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
                  All Winter Fabrics ({seasonCounts.winter})
                </button>
                {siteConfig.categories.winterCategories.map((cat) => {
                  const count = getCategoryCount(cat);
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
                      <span>{displayBrand(cat)}</span>
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
                  <option value="all">All Subcategories ({seasonCounts.all})</option>
                  <optgroup label="Summer Fabrics">
                    {siteConfig.categories.summerCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {displayBrand(cat)} ({getCategoryCount(cat)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Winter Fabrics">
                    {siteConfig.categories.winterCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {displayBrand(cat)} ({getCategoryCount(cat)})
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
                  Clear category filter ({displayBrand(selectedCategory)})
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
              <span>{displayBrand(selectedCategory)}</span>
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
            {filteredProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      {/* Craftsmanship & Authenticity Section */}
      <CraftsmanshipSection
        config={siteConfig.craftsmanship}
        onOpenAppointment={() => setIsAppointmentModalOpen(true)}
      />

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
        likeCount={activeProductForDetail ? productLikeCounts[activeProductForDetail.id] ?? 0 : 0}
        isLiked={activeProductForDetail ? likedProductIds.includes(activeProductForDetail.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onToggleLike={handleToggleProductLike}
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
    </BrandNameProvider>
  );
}
