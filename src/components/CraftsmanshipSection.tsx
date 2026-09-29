import React from 'react';
import { Scissors, ShieldCheck, Ruler, Sparkles, Video } from 'lucide-react';
import { CraftsmanshipConfig } from '../types/siteConfig';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface CraftsmanshipSectionProps {
  config: CraftsmanshipConfig;
  onOpenAppointment?: () => void;
}

export const CraftsmanshipSection: React.FC<CraftsmanshipSectionProps> = ({ config, onOpenAppointment }) => {
  const brandName = useBrandName();
  const displayBrand = (value: string) => replaceBrandName(value, brandName);

  if (!config.visible) {
    return null;
  }

  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-24 border-y border-stone-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gen-Z Atelier Editorial Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-stone-100 text-[10px] uppercase tracking-[0.2em] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{displayBrand(config.eyebrow)}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-950">
            {displayBrand(config.title)}{' '}
            <span className="font-serif italic font-normal text-amber-800 block sm:inline">
              {displayBrand(config.titleAccent)}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light max-w-2xl mx-auto">
            {displayBrand(config.description)}
          </p>
        </div>

        {/* Gen-Z Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {config.tailoring.visible && <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                  {displayBrand(config.tailoring.badge)}
                </span>
                <span className="text-xs font-mono text-stone-600 font-bold">{config.tailoring.metric}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
                {displayBrand(config.tailoring.title)}{' '}
                <span className="font-serif italic font-normal text-stone-600">
                  {displayBrand(config.tailoring.accent)}
                </span>
              </h3>

              <p className="text-sm text-stone-600 font-light leading-relaxed">
                {displayBrand(config.tailoring.description)}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
                <Ruler className="w-3.5 h-3.5 text-amber-800" />
                <span>{displayBrand(config.tailoring.benefitOne)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
                <Scissors className="w-3.5 h-3.5 text-amber-800" />
                <span>{displayBrand(config.tailoring.benefitTwo)}</span>
              </div>
            </div>
          </div>}

          {config.summerFeature.visible && <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 bg-stone-950 min-h-[300px] group">
            <img
              src={config.summerFeature.image}
              alt={displayBrand(config.summerFeature.imageAlt)}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-6 sm:p-7">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 mb-1">
                {displayBrand(config.summerFeature.eyebrow)}
              </span>
              <h3 className="text-white text-xl font-bold tracking-tight">
                {displayBrand(config.summerFeature.title)}
              </h3>
              <p className="text-stone-300 text-xs mt-1.5 font-light leading-relaxed">
                {displayBrand(config.summerFeature.description)}
              </p>
            </div>
          </div>}

          {config.winterFeature.visible && <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 bg-stone-950 min-h-[300px] group">
            <img
              src={config.winterFeature.image}
              alt={displayBrand(config.winterFeature.imageAlt)}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-6 sm:p-7">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 mb-1">
                {displayBrand(config.winterFeature.eyebrow)}
              </span>
              <h3 className="text-white text-xl font-bold tracking-tight">
                {displayBrand(config.winterFeature.title)}
              </h3>
              <p className="text-stone-300 text-xs mt-1.5 font-light leading-relaxed">
                {displayBrand(config.winterFeature.description)}
              </p>
            </div>
          </div>}

          {config.preview.visible && <div className="md:col-span-7 bg-[#F4F1EA] rounded-3xl p-7 sm:p-9 border border-stone-300/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-stone-700 bg-white/80 border border-stone-300 px-3 py-1 rounded-full font-semibold">
                  {displayBrand(config.preview.badge)}
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {displayBrand(config.preview.status)}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
                {displayBrand(config.preview.title)}{' '}
                <span className="font-serif italic font-normal text-amber-800">
                  {displayBrand(config.preview.accent)}
                </span>
              </h3>

              <p className="text-sm text-stone-600 font-light leading-relaxed">
                {displayBrand(config.preview.description)}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{displayBrand(config.preview.assurance)}</span>
              </div>

              {onOpenAppointment && (
                <button
                  onClick={onOpenAppointment}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                  <span>{displayBrand(config.preview.buttonText)}</span>
                </button>
              )}
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
};
