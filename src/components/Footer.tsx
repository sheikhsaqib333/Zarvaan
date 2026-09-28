import React, { useState } from 'react';
import { Season } from '../types/clothing';
import { FooterConfig, CategoriesConfig } from '../types/siteConfig';
import { Check, Mail, Phone, MapPin, Calendar, Instagram } from 'lucide-react';

interface FooterProps {
  onSelectSeason: (season: Season | 'all') => void;
  onOpenCalculator: () => void;
  onOpenAppointment: () => void;
  instagramUrl: string;
  footerConfig?: FooterConfig;
  categoriesConfig?: CategoriesConfig;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectSeason,
  onOpenAppointment,
  instagramUrl,
  footerConfig,
  categoriesConfig,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const handleOpenInstagram = () => {
    let target = instagramUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target.replace('@', 'instagram.com/')}`;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const bio =
    footerConfig?.brandBio ||
    'Haute ladies unstitched atelier celebrating authentic Pakistani combed lawn, designer replicas, heavy schiffli embroideries, slub khaddar, and cozy dhanak fabrics.';
  const address =
    footerConfig?.studioAddress || 'Plot 14-C, Gulberg III, Lahore, Pakistan';
  const copyright =
    footerConfig?.copyrightText ||
    'Zavraan Ladies Unstitched Haute Couture. All rights reserved.';
  const notice =
    footerConfig?.noticeBanner ||
    'Online Digital Wallets & Offline COD · Studio Fabric Preview Appointments · Made in Pakistan';

  const summerCategories = categoriesConfig?.summerCategories || [
    'Lawn Printed Suits',
    'Lawn Replica',
    'Lawn Embroidery Suits',
    'Lawn Plain Fabric',
    'Cotton Plain Fabric',
    'Cotton Embroidery',
  ];

  const winterCategories = categoriesConfig?.winterCategories || [
    'Khaddar Unstitch Printed Suit',
    'Dhanak Unstitch Printed Suits',
    'Khaddar Embroidery',
    'Dhanak Embroidery',
  ];

  return (
    <footer className="bg-[#191716] text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-2xl font-serif tracking-[0.2em] font-medium text-white">
              ZAVRAAN
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-sm leading-relaxed font-light">
              {bio}
            </p>
            <div className="pt-2 text-stone-400 text-xs space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Atelier Studio: {address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {footerConfig?.phone
                    ? `Customer Concierge: ${footerConfig.phone}`
                    : 'WhatsApp Concierge: Available 24/7 via Floating Button'}
                </span>
              </p>
              {footerConfig?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Email: {footerConfig.email}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <button
                  onClick={handleOpenInstagram}
                  className="text-stone-300 hover:text-white underline cursor-pointer text-left"
                >
                  Follow Zavraan on Instagram
                </button>
              </p>
            </div>
          </div>

          {/* Summer Unstitched Categories */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">
              {categoriesConfig?.summerCollectionTitle || 'Summer Unstitched'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              {summerCategories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectSeason('summer')}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Winter Unstitched Categories & Services */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">
              {categoriesConfig?.winterCollectionTitle || 'Winter Unstitched'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              {winterCategories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectSeason('winter')}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-stone-800">
                <button
                  onClick={onOpenAppointment}
                  className="hover:text-amber-300 text-amber-400 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Book Fabric Preview</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold">
              Atelier Registry
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              Receive private previews of upcoming seasonal lawn drops and winter dhanak suits.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-stone-900 border border-amber-900/60 text-amber-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>You are subscribed to the Zavraan registry.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 pl-8 pr-3 py-2 text-stone-200 placeholder-stone-500 text-xs focus:outline-amber-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-stone-100 hover:bg-white text-stone-900 uppercase tracking-widest py-2 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Join Patron List
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-4">
          <p>© {new Date().getFullYear()} {copyright}</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <button
              onClick={handleOpenInstagram}
              className="hover:text-pink-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Instagram className="w-3 h-3" />
              <span>Instagram Official</span>
            </button>
            <span>{notice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
