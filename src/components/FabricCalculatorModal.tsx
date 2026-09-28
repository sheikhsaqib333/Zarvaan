import React, { useState } from 'react';
import { X, Ruler, CheckCircle2, Info, Sparkles } from 'lucide-react';

interface FabricCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FabricCalculatorModal: React.FC<FabricCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [silhouette, setSilhouette] = useState<'straight' | 'aline' | 'kalidaar' | 'angrakha' | 'short_kurti'>('straight');
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [trouserStyle, setTrouserStyle] = useState<'straight' | 'palazzo' | 'tulip' | 'shalwar'>('straight');
  const [sleeveCut, setSleeveCut] = useState<'full' | 'bell' | 'quarter' | 'cuff'>('full');

  if (!isOpen) return null;

  // Yardage calculation heuristics based on traditional South Asian tailoring standards
  // Zavraan standard unstitched box provides: 3.10m shirt, 2.50m dupatta/shawl, 2.50m trouser
  const standardShirtMeters = 3.10;
  const standardTrouserMeters = 2.50;

  let estimatedShirtNeeded = 2.75;
  if (silhouette === 'straight') estimatedShirtNeeded = 2.75;
  else if (silhouette === 'aline') estimatedShirtNeeded = 3.00;
  else if (silhouette === 'kalidaar') estimatedShirtNeeded = 3.60;
  else if (silhouette === 'angrakha') estimatedShirtNeeded = 3.40;
  else if (silhouette === 'short_kurti') estimatedShirtNeeded = 2.25;

  // Add for height if above 5'7"
  const totalInches = heightFt * 12 + heightIn;
  if (totalInches >= 67) {
    estimatedShirtNeeded += 0.25;
  }

  // Trouser yardage
  let estimatedTrouserNeeded = 2.25;
  if (trouserStyle === 'palazzo') estimatedTrouserNeeded = 2.60;
  else if (trouserStyle === 'shalwar') estimatedTrouserNeeded = 2.50;
  else if (trouserStyle === 'tulip') estimatedTrouserNeeded = 2.30;

  const isShirtSufficient = standardShirtMeters >= estimatedShirtNeeded;
  const isTrouserSufficient = standardTrouserMeters >= estimatedTrouserNeeded;

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
          <Ruler className="w-4 h-4" />
          <span>Atelier Tailoring Guide</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal">
          Unstitched Yardage & Silhouette Calculator
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Verify how Zavraan's generous unstitched fabric cuts fit your desired silhouette and body measurements.
        </p>

        {/* Inputs Grid */}
        <div className="mt-6 space-y-4 text-xs">
          {/* Silhouette Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2">
              1. Desired Shirt Cut & Silhouette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'straight', label: 'Classic Straight Kurta' },
                { id: 'aline', label: 'Flowing A-Line Cut' },
                { id: 'kalidaar', label: 'Flared Kalidaar (Panels)' },
                { id: 'angrakha', label: 'Overlapping Angrakha' },
                { id: 'short_kurti', label: 'Modern Short Boxy Kurti' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSilhouette(item.id as any)}
                  className={`p-2.5 text-left border cursor-pointer transition-colors ${
                    silhouette === item.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span className="font-medium block">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Height Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1">
                2. Your Approximate Height
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <select
                    value={heightFt}
                    onChange={(e) => setHeightFt(Number(e.target.value))}
                    className="bg-white border border-stone-300 p-2 text-xs"
                  >
                    <option value={4}>4 ft</option>
                    <option value={5}>5 ft</option>
                    <option value={6}>6 ft</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <select
                    value={heightIn}
                    onChange={(e) => setHeightIn(Number(e.target.value))}
                    className="bg-white border border-stone-300 p-2 text-xs"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                      <option key={inch} value={inch}>
                        {inch} in
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Silhouette */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1">
                3. Trouser / Bottom Cut
              </label>
              <select
                value={trouserStyle}
                onChange={(e) => setTrouserStyle(e.target.value as any)}
                className="w-full bg-white border border-stone-300 p-2 text-xs"
              >
                <option value="straight">Straight Cigarette Pants</option>
                <option value="palazzo">Wide-Flared Palazzo / Culottes</option>
                <option value="tulip">Tulip Shalwar</option>
                <option value="shalwar">Traditional Pleated Shalwar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Calculation Result Box */}
        <div className="mt-6 p-4 bg-white border border-stone-300 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-serif text-base text-stone-900 font-medium">Yardage Analysis:</span>
            <span className="text-xs uppercase tracking-wider font-mono text-stone-500">
              Box Provides: 3.10M Shirt · 2.50M Trouser
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className={`p-3 border rounded-xs ${isShirtSufficient ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${isShirtSufficient ? 'text-emerald-700' : 'text-amber-700'}`} />
                <span className="font-semibold text-stone-900">Shirt Fabric: {estimatedShirtNeeded.toFixed(2)}M Needed</span>
              </div>
              <p className="text-stone-600 mt-1">
                {isShirtSufficient
                  ? `Standard Zavraan 3.10M cut has ample fabric for this silhouette including full sleeves and hem turnings.`
                  : `For a full multi-paneled kalidaar, standard 3.10M allows a medium flare. Contact bespoke concierge if requesting extra flair.`}
              </p>
            </div>

            <div className={`p-3 border rounded-xs ${isTrouserSufficient ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${isTrouserSufficient ? 'text-emerald-700' : 'text-amber-700'}`} />
                <span className="font-semibold text-stone-900">Trouser Fabric: {estimatedTrouserNeeded.toFixed(2)}M Needed</span>
              </div>
              <p className="text-stone-600 mt-1">
                {isTrouserSufficient
                  ? `Standard 2.50M trouser cloth fits perfectly with generous room for seams and tailored cuffs.`
                  : `Wide flared palazzos fit within 2.50M with standard side seams.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-500 text-[11px] pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>All unstitched packages include pre-tested shrinking margin and matching embroidered motifs.</span>
          </div>
        </div>

        {/* Close CTA */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 text-xs uppercase tracking-wider font-medium cursor-pointer"
          >
            Got it, Return to Collection
          </button>
        </div>
      </div>
    </div>
  );
};
