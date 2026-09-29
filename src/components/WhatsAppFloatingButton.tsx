import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface WhatsAppFloatingButtonProps {
  whatsappNumber: string;
  defaultMessage?: string;
  onOpenAdmin?: () => void;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  whatsappNumber,
  defaultMessage = 'Hello Zavraan Atelier! I am inquiring about your ladies unstitched collection (Lawn / Khaddar / Dhanak).',
  onOpenAdmin,
}) => {
  const brandName = useBrandName();
  const displayBrand = (text: string) => replaceBrandName(text, brandName);
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  // Sanitize number: remove spaces, dashes, plus sign
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const handleOpenWhatsApp = (text?: string) => {
    const messageToSend = displayBrand(text || defaultMessage);
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) {
      handleOpenWhatsApp();
    } else {
      handleOpenWhatsApp(customText.trim());
      setCustomText('');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Mini Chat Card Popup */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-stone-200 shadow-2xl rounded-sm overflow-hidden animate-fadeIn">
          {/* Card Header */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-serif font-bold text-sm border border-emerald-500">
                  Z
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#075E54]" />
              </div>
              <div>
                <h4 className="font-medium text-xs text-white">{displayBrand('Zavraan Atelier Concierge')}</h4>
                <p className="text-[10px] text-emerald-200">Online · Fabric & Order Inquiries</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-3.5 bg-[#ECE5DD] space-y-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-sm shadow-2xs max-w-[90%] text-stone-800 space-y-1">
              <p className="text-[11px] leading-relaxed">
                As-salamu alaykum! Welcome to <strong>{brandName}</strong>.
              </p>
              <p className="text-[11px] leading-relaxed text-stone-600">
                How may we assist you with our ladies unstitched summer lawn or winter khaddar & dhanak suits today?
              </p>
              <span className="text-[9px] text-stone-400 block text-right">Just now</span>
            </div>

            <div className="text-[10px] text-stone-500 text-center font-mono">
              Redirects to official WhatsApp: +{cleanNumber}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-2.5 bg-white border-t border-stone-100 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleOpenWhatsApp('Hello, I want to inquire about Lawn Printed Suits & Lawn Replicas.')}
              className="text-[10px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-1 rounded-xs border border-stone-200 cursor-pointer text-left"
            >
              Summer Lawn Inquiries
            </button>
            <button
              onClick={() => handleOpenWhatsApp('Hello, please share fabric details for Dhanak & Khaddar unstitched suits.')}
              className="text-[10px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-1 rounded-xs border border-stone-200 cursor-pointer text-left"
            >
              Winter Dhanak / Khaddar
            </button>
            <button
              onClick={() => handleOpenWhatsApp('Hello, I would like to book a fabric preview session before purchasing.')}
              className="text-[10px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-1 rounded-xs border border-stone-200 cursor-pointer text-left"
            >
              Book Fabric Preview
            </button>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendCustom} className="p-2.5 bg-stone-50 border-t border-stone-200 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="flex-1 bg-white border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 rounded-sm focus:outline-[#075E54]"
            />
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-sm cursor-pointer shadow-xs transition-colors flex items-center justify-center"
              title="Send to WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-white text-stone-800 text-xs py-1.5 px-3 rounded-full shadow-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-all animate-bounce"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Chat on WhatsApp</span>
          </div>
        )}

        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              // Direct click toggles card or direct opens WhatsApp
              setIsOpen(true);
            }
          }}
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Open WhatsApp Chat"
          title={`WhatsApp Concierge: +${cleanNumber}`}
        >
          {/* Animated pulsing wave */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

          {/* WhatsApp SVG Icon */}
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
