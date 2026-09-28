import React from 'react';
import { LAWN_PRINTS_IMAGE, DHANAK_KHADDAR_IMAGE, SUMMER_LAWN_IMAGE } from '../data/products';
import {
  Scissors,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Ruler,
  Sparkles,
  Video,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface CraftsmanshipSectionProps {
  onOpenAppointment?: () => void;
}

export const CraftsmanshipSection: React.FC<CraftsmanshipSectionProps> = ({ onOpenAppointment }) => {
  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-24 border-y border-stone-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gen-Z Atelier Editorial Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-stone-100 text-[10px] uppercase tracking-[0.2em] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>The Raw Yardage Advantage // Drop 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-950">
            Why Gen-Z Chooses Raw Fabric{' '}
            <span className="font-serif italic font-normal text-amber-800 block sm:inline">
              Over Fast Fashion.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light max-w-2xl mx-auto">
            Standard ready-made clothes force you into generic S/M/L cuts that compromise on sleeve length, flare, and neckline. Pure unstitched yardage gives you full creative agency to tailor your fit.
          </p>
        </div>

        {/* Gen-Z Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Item 1: Freedom of Custom Tailoring (Spans 7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                  01 // Total Silhouette Freedom
                </span>
                <span className="text-xs font-mono text-stone-600 font-bold">8.10M Cut</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
                No Pre-Stitched Compromises.{' '}
                <span className="font-serif italic font-normal text-stone-600">
                  Cut It Oversized, Straight, or Flared.
                </span>
              </h3>

              <p className="text-sm text-stone-600 font-light leading-relaxed">
                Every Zavraan unstitched suit comes with a generous raw cut: <strong>3.10M+ shirt fabric</strong>, <strong>2.50M trouser yardage</strong>, and a <strong>2.50M dupatta</strong>. Whether you want deep drop-shoulder sleeves, breezy kalidar panels, or minimal cigarette cuts, your tailor never runs short of fabric.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
                <Ruler className="w-3.5 h-3.5 text-amber-800" />
                <span>3.10M+ Generous Shirt Cut</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
                <Scissors className="w-3.5 h-3.5 text-amber-800" />
                <span>Zero Sizing Chart Drama</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Authentic Summer Weaves (Spans 5 cols) */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 bg-stone-950 min-h-[300px] group">
            <img
              src={LAWN_PRINTS_IMAGE}
              alt="Airjet combed summer lawn fabric weave"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-6 sm:p-7">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 mb-1">
                SUMMER VAULT · 80s WEAVE
              </span>
              <h3 className="text-white text-xl font-bold tracking-tight">
                Airjet Combed Swiss Lawn
              </h3>
              <p className="text-stone-300 text-xs mt-1.5 font-light leading-relaxed">
                Super breathable long-staple cotton woven on precision airjet looms. Featherlight drape, high-definition botanical prints, and zero color bleeding.
              </p>
            </div>
          </div>

          {/* Bento Item 3: Winter Texture Vault (Spans 5 cols) */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 bg-stone-950 min-h-[300px] group">
            <img
              src={DHANAK_KHADDAR_IMAGE}
              alt="Double brushed winter dhanak and heavy slub khaddar"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-6 sm:p-7">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 mb-1">
                WINTER EDIT · COZY HEAVY YARNS
              </span>
              <h3 className="text-white text-xl font-bold tracking-tight">
                Slub Khaddar & Brushed Dhanak
              </h3>
              <p className="text-stone-300 text-xs mt-1.5 font-light leading-relaxed">
                Heavy textured slub weaves and peach-brushed surfaces engineered for natural cold-weather insulation without feeling stiff or itchy.
              </p>
            </div>
          </div>

          {/* Bento Item 4: Live 1-on-1 Video Preview & Instant Trust (Spans 7 cols) */}
          <div className="md:col-span-7 bg-[#F4F1EA] rounded-3xl p-7 sm:p-9 border border-stone-300/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-stone-700 bg-white/80 border border-stone-300 px-3 py-1 rounded-full font-semibold">
                  02 // Authentic Transparency
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Live Preview Available
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
                No Blind Orders.{' '}
                <span className="font-serif italic font-normal text-amber-800">
                  Inspect the Raw Weave on Video.
                </span>
              </h3>

              <p className="text-sm text-stone-600 font-light leading-relaxed">
                We believe in zero filter gimmicks. Book a free 5-minute video call with our fabric masters to examine the drape, inspect resham embroidery under daylight, or check the thickness of the chiffon dupatta before paying.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Colorfast Reactive Dyes Tested</span>
              </div>

              {onOpenAppointment && (
                <button
                  onClick={onOpenAppointment}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                  <span>Book Free Video Preview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
