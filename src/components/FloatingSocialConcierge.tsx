import React, { useState } from 'react';
import { MessageCircle, Instagram, ArrowUpRight } from 'lucide-react';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface FloatingSocialConciergeProps {
  whatsappNumber: string;
  defaultMessage?: string;
  instagramUrl: string;
}

export const FloatingSocialConcierge: React.FC<FloatingSocialConciergeProps> = ({
  whatsappNumber,
  defaultMessage = 'Hello Zavraan Atelier! I am inquiring about your ladies unstitched collection (Lawn / Khaddar / Dhanak).',
  instagramUrl,
}) => {
  const brandName = useBrandName();
  const [showTooltip, setShowTooltip] = useState(false);
  const message = replaceBrandName(defaultMessage, brandName);

  // Sanitize number: remove non-digits
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInstagram = () => {
    let target = instagramUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target.replace('@', 'instagram.com/')}`;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Floating Instagram Button */}
      <div className="flex items-center gap-2 group">
        <span className="hidden sm:inline-block bg-white text-stone-800 text-[11px] py-1 px-2.5 rounded-full shadow-md border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium pointer-events-none">
          Follow on Instagram
        </span>
        <button
          onClick={handleOpenInstagram}
          className="w-11 h-11 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Visit Instagram Page"
          title={`Visit ${brandName} on Instagram`}
        >
          <Instagram className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Floating WhatsApp Button */}
      <div 
        className="flex items-center gap-2 relative group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Subtle persistent label on desktop */}
        <div
          onClick={handleOpenWhatsApp}
          className="hidden sm:flex items-center gap-1.5 bg-white text-stone-800 text-xs py-1.5 px-3 rounded-full shadow-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-stone-800">Chat on WhatsApp</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
        </div>

        {/* The Direct WhatsApp Redirect Button */}
        <button
          onClick={handleOpenWhatsApp}
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Chat directly on WhatsApp"
          title={`Click to chat on WhatsApp (+${cleanNumber})`}
        >
          {/* Subtle animated ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

          {/* Official WhatsApp SVG Icon */}
          <svg
            className="w-7 h-7 fill-white relative z-10"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.838 11.838 0 005.71 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
