import React, { useState, useEffect, useRef } from 'react';
import { Season, Product } from '../types/clothing';
import { HomeScreenConfig, HeroSlideConfig } from '../types/siteConfig';
import { buildDefaultHeroSlides } from '../utils/heroSlides';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Feather,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video,
  Flame,
} from 'lucide-react';

interface HeroProps {
  onSelectSeason: (season: Season | 'all') => void;
  onSelectCategory?: (category: string, season?: Season) => void;
  activeSeason: Season | 'all';
  onScrollToCatalog: () => void;
  onOpenAppointment: () => void;
  homeConfig?: HomeScreenConfig;
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({
  onSelectSeason,
  onSelectCategory,
  onScrollToCatalog,
  onOpenAppointment,
  homeConfig,
  products = [],
}) => {
  const brandName = useBrandName();
  const displayBrand = (value: string) => replaceBrandName(value, brandName);
  const badge = displayBrand(homeConfig?.announcementBadge || 'SS’26 ARCHIVE · 100% RAW YARDAGE ATELIER');
  const headline1 = displayBrand(homeConfig?.headlinePart1 || 'Unstitched Couture.');
  const headline2 = displayBrand(homeConfig?.headlinePart2 || 'Zero Sizing Limits.');
  const subheadline = displayBrand(
    homeConfig?.subheadline ||
      'Why settle for stiff, ill-fitting pre-stitched racks? Zavraan curates 100% pure raw yardage — from airy combed Swiss lawns & designer replicas to cozy slub khaddar & plush dhanak. Tailor the drape to your exact silhouette.'
  );
  const primaryBtn = displayBrand(homeConfig?.primaryButtonText || 'Explore Drops');
  const secondaryBtn = displayBrand(homeConfig?.secondaryButtonText || 'Book Live Video Preview');
  const notice = displayBrand(
    homeConfig?.previewNotice || 'Preview fabrics over live 1-on-1 video call before placing your order.'
  );
  const s1Val = homeConfig?.stat1Value || '8.10M+';
  const s1Lbl = displayBrand(homeConfig?.stat1Label || 'Generous Cut');
  const s2Val = homeConfig?.stat2Value || '100%';
  const s2Lbl = displayBrand(homeConfig?.stat2Label || 'Pure Ladies Unstitched');
  const s3Val = homeConfig?.stat3Value || 'COD & Wallets';
  const s3Lbl = displayBrand(homeConfig?.stat3Label || 'Direct Checkout');

  // Build dynamic slide list including products with distinct categories
  const slides = React.useMemo<HeroSlideConfig[]>(
    () =>
      (homeConfig?.heroSlides?.length
        ? homeConfig.heroSlides
        : buildDefaultHeroSlides(products, homeConfig?.heroImage)).map((slide) => ({
          ...slide,
          category: displayBrand(slide.category),
          caption: displayBrand(slide.caption),
          dropTag: slide.dropTag ? displayBrand(slide.dropTag) : undefined,
        })),
    [products, homeConfig?.heroImage, homeConfig?.heroSlides, brandName]
  );

  // Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentSlideIndex((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  // Auto-advance slideshow with smooth interval
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleBrowseCategory = (category: string, season: Season) => {
    if (onSelectCategory) {
      onSelectCategory(category, season);
    } else {
      onSelectSeason(season);
      onScrollToCatalog();
    }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <section className="relative overflow-hidden bg-[#FAF9F5] border-b border-stone-200">
      {/* Gen-Z Infinite Scrolling Marquee Ticker */}
      <div className="bg-stone-900 text-stone-200 overflow-hidden py-2 border-b border-stone-800 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium selection:bg-stone-800">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          <span>✦ DROP 2026 // PURE UNSTITCHED ATELIER</span>
          <span className="text-amber-400">✦ ZERO PRE-STITCHED COMPROMISES · TAILOR TO YOUR VIBE</span>
          <span>✦ 80s AIRJET COMBED LAWN</span>
          <span className="text-amber-400">✦ MASTER COUTURE REPLICAS</span>
          <span>✦ SLUB TEXTURED WINTER KHADDAR</span>
          <span className="text-amber-400">✦ DOUBLE-BRUSHED WARM DHANAK</span>
          <span>✦ CASH ON DELIVERY & INSTANT DIGITAL WALLETS</span>
          <span className="text-amber-400">✦ 1-ON-1 LIVE VIDEO FABRIC PREVIEWS</span>
          <span>✦ 100% COLORFAST CERTIFIED DYES</span>

          {/* Marquee Repeat Block for Seamless Loop */}
          <span>✦ DROP 2026 // PURE UNSTITCHED ATELIER</span>
          <span className="text-amber-400">✦ ZERO PRE-STITCHED COMPROMISES · TAILOR TO YOUR VIBE</span>
          <span>✦ 80s AIRJET COMBED LAWN</span>
          <span className="text-amber-400">✦ MASTER COUTURE REPLICAS</span>
          <span>✦ SLUB TEXTURED WINTER KHADDAR</span>
          <span className="text-amber-400">✦ DOUBLE-BRUSHED WARM DHANAK</span>
          <span>✦ CASH ON DELIVERY & INSTANT DIGITAL WALLETS</span>
          <span className="text-amber-400">✦ 1-ON-1 LIVE VIDEO FABRIC PREVIEWS</span>
          <span>✦ 100% COLORFAST CERTIFIED DYES</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Gen-Z Editorial Headline & Micro-Interactions */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            {/* Aesthetic Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/5 border border-stone-300/80 text-[11px] uppercase tracking-[0.2em] text-stone-800 font-semibold w-fit backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span>{badge}</span>
            </div>

            {/* High-Impact Gen-Z Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-stone-950 leading-[1.08]">
              {headline1} <br />
              <span className="font-serif italic font-normal text-amber-800 tracking-normal">
                {headline2}
              </span>
            </h1>

            {/* Youthful / Gen-Z Relatable Subheadline */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl font-light leading-relaxed">
              {subheadline}
            </p>

            {/* Aesthetic Gen-Z Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onScrollToCatalog}
                className="group px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-[0.18em] font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                <span>{primaryBtn}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={onOpenAppointment}
                className="px-6 py-3.5 bg-white/80 hover:bg-white text-stone-900 border border-stone-300 hover:border-stone-900 text-xs uppercase tracking-[0.16em] font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-95 backdrop-blur-sm"
              >
                <Video className="w-4 h-4 text-amber-700" />
                <span>{secondaryBtn}</span>
              </button>
            </div>

            {/* Video Preview & Authenticity Tag */}
            <div className="pt-1">
              <p className="text-xs text-stone-500 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{notice}</span>
              </p>
            </div>

            {/* Quantitative Proof Adjacency */}
            <div className="pt-4 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-stone-900 tabular-nums tracking-tight">
                  {s1Val}
                </span>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">{s1Lbl}</p>
              </div>
              <div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-stone-900 tabular-nums tracking-tight">
                  {s2Val}
                </span>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">{s2Lbl}</p>
              </div>
              <div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-stone-900 tabular-nums tracking-tight">
                  {s3Val}
                </span>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">{s3Lbl}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Ultra-Aesthetic Slideshow Container */}
          <div className="lg:col-span-7 relative flex flex-col space-y-4">
            {/* Main Rounded Slideshow Viewport */}
            <div
              className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/10.5] min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-300/80 bg-stone-950 group select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Instagram/TikTok Story-Style Segmented Progress Bars at Top */}
              <div className="absolute top-4 inset-x-6 z-30 flex items-center gap-1.5">
                {slides.map((_, barIdx) => (
                  <button
                    key={barIdx}
                    onClick={() => setCurrentSlideIndex(barIdx)}
                    className="flex-1 h-1 rounded-full overflow-hidden bg-white/25 hover:bg-white/40 transition-colors cursor-pointer"
                    aria-label={`Jump to slide ${barIdx + 1}`}
                  >
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        barIdx === currentSlideIndex
                          ? 'w-full'
                          : barIdx < currentSlideIndex
                          ? 'w-full opacity-60'
                          : 'w-0'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Floating Top Category Pill with Active Live Beacon */}
              <div className="absolute top-8 left-6 z-30 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentSlide.dropTag || currentSlide.category}</span>
                </span>
              </div>

              {/* Floating Gen-Z Sticker Badge on Top Right */}
              <div className="absolute top-8 right-6 z-30 hidden sm:flex">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider transform rotate-1 shadow-lg border border-amber-300">
                  ⚡︎ 100% Raw Yardage
                </span>
              </div>

              {/* Smoothly Animated Slides with Ken Burns Ease */}
              {slides.map((slide, index) => {
                const isActive = index === currentSlideIndex;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-out ${
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                  >
                    {/* Background Image with Smooth Scale Zoom Animation */}
                    <img
                      src={slide.image}
                      alt={slide.category}
                      className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out hover:scale-103"
                      referrerPolicy="no-referrer"
                    />

                    {/* Rich Modern Scrim: Dark at Bottom for Text Contrast, Clear at Center */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-black/20" />

                    {/* Bottom Container: Reduced to Just Category Browse Button & One-Liner Caption */}
                    <div
                      className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-start gap-3 z-20 transition-all duration-700 delay-100 ease-out ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                    >
                      {/* One Liner Caption of the Category */}
                      <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-lg text-shadow-sm drop-shadow-sm">
                        {slide.caption}
                      </p>

                      {/* Browse Relevant Category Button with Gen-Z Aesthetic Micro-Interaction */}
                      <button
                        onClick={() => handleBrowseCategory(slide.category, slide.season)}
                        className="bg-white/95 hover:bg-white text-stone-950 text-xs uppercase tracking-[0.16em] px-6 py-2.5 rounded-full font-bold flex items-center gap-2 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-103 backdrop-blur-md active:scale-95 group"
                      >
                        <span>Browse {slide.category}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-800 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Prev / Next Slide Controls (Aesthetic Circular Glass Pills) */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-90"
                aria-label="Previous Category Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-90"
                aria-label="Next Category Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Rounded Thumbnail & Category Quick Pills */}
            <div className="pt-1">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {slides.map((s, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`relative flex flex-col text-left rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'border-amber-700 ring-2 ring-amber-600/40 shadow-sm scale-102 bg-white'
                          : 'border-stone-300/80 bg-white/70 opacity-70 hover:opacity-100 hover:border-stone-500'
                      }`}
                      title={s.category}
                    >
                      <div className="h-11 w-full bg-stone-200 relative overflow-hidden">
                        <img
                          src={s.image}
                          alt={s.category}
                          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-amber-900/20 border-b-2 border-amber-600" />
                        )}
                      </div>
                      <div className="px-1.5 py-1">
                        <span className="block text-[9px] font-semibold text-stone-900 truncate leading-tight">
                          {s.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip (Gen-Z Clean Aesthetic) */}
      <div className="bg-[#F2EFE9] border-t border-stone-200/80 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs text-stone-700 font-medium">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-amber-800" />
            <span>100% Pure Ladies Unstitched Suits</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>Colorfast Certified Reactive Dye Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>COD & Digital Wallets (Easypaisa, Nayapay, SadaPay, Bank)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
