import React from 'react';
import { ShieldCheck, MessageCircle, Truck, RefreshCw, Database, Phone, Mail, MapPin, Instagram, Video, Share2, FileText, Lock, Cookie, ArrowUpRight } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  onOpenAdmin: () => void;
  settings: StoreSettings;
  onNavigate: (page: 'home' | 'collections' | 'contact', category?: string) => void;
  onOpenLegal: (policy: 'terms' | 'privacy' | 'cookie') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  settings,
  onNavigate,
  onOpenLegal
}) => {
  const activeWhatsApp = settings.merchantWhatsApp || '+447591878215';
  const cleanPhone = activeWhatsApp.replace(/[^0-9+]/g, '').replace('+', '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Style & Class London, I have a question about an item or my order.')}`;

  return (
    <footer className="bg-[#090a0f] text-white mt-20 pt-16 pb-12 border-t border-[#d4a853]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider uppercase font-serif">
                  Style <span className="text-[#d4a853]">&amp;</span> Class
                </span>
                <span className="w-2 h-2 rounded-full bg-[#d4a853] mb-1" />
              </div>
              <span className="text-[10px] tracking-[0.25em] text-[#b8b0a8] uppercase font-bold">
                PRE-LOVED &middot; UK FASHION BOUTIQUE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Curated pre-loved and second-hand women&apos;s, men&apos;s, kids&apos; garments and designer accessories. Sourced, verified, sanitized, and steam-pressed in London. Giving extraordinary clothes a sustainable second life.
            </p>

            {/* Social Media Links from styleandclass.store */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-wider block mb-2.5">
                Follow Style &amp; Class
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  id="social-instagram-link"
                  href={settings.instagram || 'https://www.instagram.com/danmark.uk'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#181a24] hover:bg-[#E1306C] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm group"
                  title="Instagram: @danmark.uk"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  id="social-tiktok-link"
                  href={settings.tiktok || 'https://www.tiktok.com/@danmark.fashion5'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#181a24] hover:bg-black border border-slate-700 flex items-center justify-center text-slate-300 hover:text-[#00f2fe] transition-all shadow-sm"
                  title="TikTok: @danmark.fashion5"
                >
                  <Video className="w-4 h-4" />
                </a>

                <a
                  id="social-facebook-link"
                  href={settings.facebook || 'https://www.facebook.com/share/1DV7Qjem6m/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#181a24] hover:bg-[#1877F2] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Facebook Page"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation Menu (from styleandclass.store) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#d4a853]">
              Quick Menu
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('collections', 'all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  All Items (Collections)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('collections', 'women');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Women Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('collections', 'men');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Men Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('collections', 'kids');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Kids Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('collections', 'accessories');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Bags &amp; Accessories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#d4a853] transition-colors"
                >
                  Contact &amp; Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details from styleandclass.store */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#d4a853]">
              London Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d4a853] shrink-0" />
                <a href={`tel:${settings.merchantPhone || '+4407591878215'}`} className="hover:text-white transition-colors font-mono">
                  {settings.merchantPhone || '+44 07591878215'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 fill-[#25D366]" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-mono"
                >
                  WhatsApp: {settings.merchantWhatsApp || '+44 7591 878215'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${settings.merchantEmail || 'styleandclasslondon@gmail.com'}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {settings.merchantEmail || 'styleandclasslondon@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{settings.location || 'London, United Kingdom'} &middot; 24/7</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                id="footer-wa-btn"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] text-black text-xs font-extrabold hover:bg-[#20ba5a] transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>Direct WhatsApp Order</span>
              </a>
            </div>
          </div>

          {/* Legal & Policies (from styleandclass.store) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#d4a853]">
              Legal &amp; Admin
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-[#d4a853] transition-colors flex items-center gap-1.5 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms &amp; Conditions</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-[#d4a853] transition-colors flex items-center gap-1.5 text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('cookie')}
                  className="hover:text-[#d4a853] transition-colors flex items-center gap-1.5 text-left"
                >
                  <Cookie className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cookie Policy</span>
                </button>
              </li>
            </ul>

            <div className="pt-3">
              <button
                id="footer-open-admin-btn"
                type="button"
                onClick={onOpenAdmin}
                className="px-3 py-2 bg-[#181a24] hover:bg-[#202330] text-[#f5c469] text-xs font-bold rounded-xl flex items-center gap-2 border border-[#d4a853]/40 transition-all shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>Store Database &amp; Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Style And Class London. Pre-Loved Fashion. All rights reserved.</p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-[#181a24] border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-bold">
              PayPal (UK)
            </span>
            <span className="bg-[#181a24] border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-bold">
              WhatsApp Direct
            </span>
            <span className="bg-[#181a24] border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-bold">
              Evri &middot; InPost &middot; Royal Mail
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
