import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Leaf, RefreshCw, Star, CheckCircle2, ChevronRight, Eye, ShoppingBag, MessageCircle, Truck } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onQuickView: (product: Product) => void;
  onNavigateCollections: (category?: string) => void;
  settings: StoreSettings;
}

const TYPEWRITER_WORDS = ['Treasure', 'Statement', 'Favorite', 'Classic', 'Story'];

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onQuickView,
  onNavigateCollections,
  settings
}) => {
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [heroBgIndex, setHeroBgIndex] = useState(0);

  const heroImages = [
    '/assets/BOX1-1_1788975756099_1.jpg',
    '/assets/BOX1-4_1788977065851_1.jpg',
    '/assets/BOX1-2_1788976220467_1.jpg',
    '/assets/BOX1-3_1788976608814_1.jpg'
  ];

  // Typewriter effect
  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[typewriterIndex];
    const typingSpeed = isDeleting ? 60 : 120;

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setTypewriterIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
      } else {
        setDisplayText(
          isDeleting
            ? currentWord.substring(0, displayText.length - 1)
            : currentWord.substring(0, displayText.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typewriterIndex]);

  // Background carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const activeProducts = products.filter((p) => p.status === 'active' && p.stock > 0);
  const featuredProducts = activeProducts.filter((p) => p.featured).slice(0, 4);
  const womenProducts = activeProducts.filter((p) => p.collection === 'women').slice(0, 4);
  const menProducts = activeProducts.filter((p) => p.collection === 'men').slice(0, 4);
  const kidsProducts = activeProducts.filter((p) => p.collection === 'kids').slice(0, 4);
  const accessoriesProducts = activeProducts.filter((p) => p.collection === 'accessories').slice(0, 4);

  const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9+]/g, '').replace('+', '');

  return (
    <div className="space-y-16 sm:space-y-24 text-slate-100 pb-16">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[620px] sm:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-[#d4a853]/25 bg-gradient-to-b from-[#0a0c12] via-[#06070a] to-[#050608]">
        {/* London Night Sky and Citylights Glow Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Background Carousel of garments */}
          <div className="absolute inset-0 opacity-15 mix-blend-screen">
            <img
              src={heroImages[heroBgIndex]}
              alt="Hero Background"
              className="w-full h-full object-cover filter blur-lg scale-105 transition-opacity duration-1000"
            />
          </div>

          {/* Golden & Amber City Ambient Radial Glows */}
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#d4a853]/15 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute -top-20 right-1/4 w-[28rem] h-[28rem] bg-[#f59e0b]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* London Skyline Architectural Silhouette (The Shard, Gherkin, London Eye, Big Ben) */}
          <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 opacity-30 pointer-events-none flex items-end">
            <svg
              className="w-full h-full text-slate-800"
              viewBox="0 0 1440 280"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skylineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d4a853" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#1e2230" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#090a0f" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Tower Bridge & The Shard & London Skyline silhouette shapes */}
              <path
                d="M0 280 L0 230 L40 230 L40 210 L65 210 L65 230 L110 230 L110 170 L130 170 L130 230 L180 230 L220 120 L240 120 L280 230 L320 230 L320 190 L345 190 L345 150 L355 110 L365 150 L365 230 L430 230 L450 180 L480 180 L500 230 L560 230 L560 140 L590 140 L590 80 L600 50 L610 80 L610 140 L640 140 L640 230 L710 230 L750 160 L780 160 L820 230 L880 230 L880 190 L910 190 L930 90 L940 90 L960 190 L990 190 L990 230 L1050 230 L1070 150 L1110 150 L1130 230 L1190 230 L1210 130 L1230 130 L1250 230 L1320 230 L1340 175 L1375 175 L1395 230 L1440 230 L1440 280 Z"
                fill="url(#skylineGrad)"
              />

              {/* Animated Rotating London Eye Wheel Silhouette */}
              <g className="animate-london-eye">
                <circle cx="1170" cy="170" r="45" stroke="#d4a853" strokeWidth="1.8" strokeOpacity="0.45" strokeDasharray="4 4" />
                <line x1="1170" y1="125" x2="1170" y2="215" stroke="#d4a853" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="1125" y1="170" x2="1215" y2="170" stroke="#d4a853" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="1138" y1="138" x2="1202" y2="202" stroke="#d4a853" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="1138" y1="202" x2="1202" y2="138" stroke="#d4a853" strokeWidth="1.2" strokeOpacity="0.4" />
              </g>
              <circle cx="1170" cy="170" r="5" fill="#d4a853" fillOpacity="0.8" />
              <line x1="1170" y1="170" x2="1170" y2="230" stroke="#d4a853" strokeWidth="2.5" strokeOpacity="0.5" />
            </svg>
          </div>

          {/* Sweeping Night City Beams (Searchlights like West End / Westminster) */}
          <div className="absolute -bottom-10 left-1/4 w-36 h-[520px] bg-gradient-to-t from-[#d4a853]/35 via-[#f5c469]/15 to-transparent blur-3xl transform origin-bottom animate-city-beam pointer-events-none" />
          <div className="absolute -bottom-10 right-1/3 w-44 h-[550px] bg-gradient-to-t from-[#38bdf8]/30 via-[#60a5fa]/15 to-transparent blur-3xl transform origin-bottom animate-city-beam pointer-events-none" style={{ animationDelay: '-4.5s' }} />

          {/* Living London Night Traffic Lights (Fast Red & White Car Light Streaks along Embankment) */}
          <div className="absolute bottom-8 left-0 right-0 h-1 pointer-events-none overflow-hidden opacity-60">
            {/* White Headlights rushing forward */}
            <div className="absolute top-0 h-[2px] w-48 bg-gradient-to-r from-transparent via-white to-amber-200 blur-[0.8px] shadow-[0_0_12px_2px_rgba(255,255,255,0.9)] animate-traffic-left-1" />
            <div className="absolute top-0 h-[2px] w-64 bg-gradient-to-r from-transparent via-amber-100 to-amber-300 blur-[0.8px] shadow-[0_0_12px_2px_rgba(251,191,36,0.9)] animate-traffic-left-2" />
            {/* Red Taillights rushing reverse */}
            <div className="absolute top-0 h-[2px] w-56 bg-gradient-to-r from-rose-500 via-red-500 to-transparent blur-[0.8px] shadow-[0_0_14px_3px_rgba(239,68,68,0.9)] animate-traffic-right-1" />
            <div className="absolute top-0 h-[2px] w-72 bg-gradient-to-r from-red-600 via-rose-400 to-transparent blur-[0.8px] shadow-[0_0_14px_3px_rgba(244,63,94,0.9)] animate-traffic-right-2" />
          </div>

          {/* Floating Gold Luxury Sparks (Ascending like London gala stardust) */}
          <div className="absolute bottom-24 left-[15%] w-2 h-2 rounded-full bg-[#d4a853] shadow-[0_0_12px_3px_rgba(212,168,83,0.9)] animate-sparkle-1 pointer-events-none" />
          <div className="absolute bottom-20 left-[28%] w-1.5 h-1.5 rounded-full bg-[#fef08a] shadow-[0_0_10px_2px_rgba(254,240,138,0.9)] animate-sparkle-2 pointer-events-none" />
          <div className="absolute bottom-16 right-[22%] w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_14px_4px_rgba(251,191,36,0.9)] animate-sparkle-3 pointer-events-none" />
          <div className="absolute bottom-32 right-[36%] w-2 h-2 rounded-full bg-[#d4a853] shadow-[0_0_12px_3px_rgba(212,168,83,0.9)] animate-sparkle-4 pointer-events-none" />
          <div className="absolute bottom-12 left-[50%] w-1.5 h-1.5 rounded-full bg-[#fde047] shadow-[0_0_10px_2px_rgba(253,224,71,0.9)] animate-sparkle-5 pointer-events-none" />

          {/* Shimmering Bokeh Citylights (London West End & Piccadilly Ambiance) */}
          {/* Group 1: Warm Amber & Gold streetlights */}
          <div className="absolute top-[18%] left-[8%] w-3 h-3 rounded-full bg-[#f59e0b] blur-[1px] shadow-[0_0_16px_5px_rgba(245,158,11,0.85)] animate-citylight" />
          <div className="absolute top-[28%] left-[16%] w-4.5 h-4.5 rounded-full bg-[#d4a853] blur-[1px] shadow-[0_0_22px_8px_rgba(212,168,83,0.9)] animate-citylight-slow" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-[42%] left-[6%] w-2.5 h-2.5 rounded-full bg-[#fbbf24] blur-[1px] shadow-[0_0_14px_4px_rgba(251,191,36,0.8)] animate-citylight-fast" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-[65%] left-[12%] w-3.5 h-3.5 rounded-full bg-[#f59e0b] blur-[1.5px] shadow-[0_0_18px_6px_rgba(245,158,11,0.8)] animate-citylight" style={{ animationDelay: '2.4s' }} />
          
          {/* Group 2: Center and London Bridges glow */}
          <div className="absolute top-[14%] right-[24%] w-3.5 h-3.5 rounded-full bg-[#38bdf8] blur-[1px] shadow-[0_0_16px_5px_rgba(56,189,248,0.8)] animate-citylight-slow" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[22%] right-[12%] w-5 h-5 rounded-full bg-[#d4a853] blur-[1px] shadow-[0_0_24px_8px_rgba(212,168,83,0.95)] animate-citylight" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[36%] right-[6%] w-3 h-3 rounded-full bg-[#f43f5e] blur-[1px] shadow-[0_0_14px_4px_rgba(244,63,94,0.7)] animate-citylight-fast" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[54%] right-[15%] w-3.5 h-3.5 rounded-full bg-[#fbbf24] blur-[1px] shadow-[0_0_18px_5px_rgba(251,191,36,0.85)] animate-citylight-slow" style={{ animationDelay: '2.1s' }} />
          
          {/* Lower skyline window lights */}
          <div className="absolute bottom-28 left-[23%] w-2 h-2 rounded-full bg-[#fef08a] shadow-[0_0_12px_4px_rgba(254,240,138,0.9)] animate-citylight-fast" style={{ animationDelay: '0.9s' }} />
          <div className="absolute bottom-32 left-[39%] w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_12px_4px_rgba(56,189,248,0.85)] animate-citylight" style={{ animationDelay: '2.7s' }} />
          <div className="absolute bottom-24 right-[31%] w-2.5 h-2.5 rounded-full bg-[#d4a853] shadow-[0_0_14px_5px_rgba(212,168,83,0.85)] animate-citylight-slow" style={{ animationDelay: '1.1s' }} />
          <div className="absolute bottom-36 right-[42%] w-2 h-2 rounded-full bg-[#fb923c] shadow-[0_0_12px_4px_rgba(251,146,60,0.85)] animate-citylight-fast" style={{ animationDelay: '0.3s' }} />

          {/* Smooth bottom blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#131722]/85 border border-[#d4a853]/60 text-[#f5c469] text-xs font-bold uppercase tracking-widest shadow-xl shadow-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <span className="w-2 h-2 rounded-full bg-[#d4a853] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>London Night Lights &middot; Pre-Loved Boutique</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-serif tracking-tight leading-tight drop-shadow-2xl">
            Find Your Next{' '}
            <span className="relative inline-block text-[#d4a853] italic font-serif animate-neon-text">
              <span className="relative z-10">{displayText}</span>
              <span className="animate-pulse">|</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4a853] to-transparent rounded-full opacity-90" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md">
            Curated vintage &amp; designer fashion illuminated under the London night lights. Each garment is a unique 1-of-1 piece, authenticated and dispatched directly across the UK.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={() => onNavigateCollections('all')}
              className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-sm rounded-xl shadow-xl shadow-[#d4a853]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              {/* Shimmer light sweep across button */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
              <span>Shop All Items</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateCollections('women')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#141722]/90 hover:bg-[#1a1f2e] text-white hover:text-[#d4a853] font-bold text-sm rounded-xl border border-slate-700/80 hover:border-[#d4a853]/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <span>Explore Women</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateCollections('accessories')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#141722]/90 hover:bg-[#1a1f2e] text-white hover:text-[#d4a853] font-bold text-sm rounded-xl border border-slate-700/80 hover:border-[#d4a853]/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <span>Explore Bags</span>
            </button>
          </div>

          {/* Micro Value Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4a853]" />
              <span>1-of-1 Authentic Pieces</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#d4a853]" />
              <span>UK Tracked 24-48h Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d4a853]" />
              <span>PayPal UK Buyer Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VALUES GRID (matching styleandclass.store) ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
            Our Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            Why <em>Style <span className="text-[#d4a853] not-italic font-serif">&amp;</span> Class?</em>
          </h2>
          <div className="w-12 h-0.5 bg-[#d4a853] mx-auto my-3" />
          <p className="text-xs sm:text-sm text-slate-400">
            Style shouldn&apos;t cost the earth — or your savings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-slate-800 hover:border-[#d4a853]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-xl group-hover:scale-110 transition-transform">
              &#9854;
            </div>
            <h3 className="text-base font-bold text-white font-serif">Sustainable Style</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every purchase gives clothes a second life, dramatically reducing landfill waste and fast-fashion carbon emissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1017] border border-slate-800 hover:border-[#d4a853]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-xl group-hover:scale-110 transition-transform">
              &#9733;
            </div>
            <h3 className="text-base font-bold text-white font-serif">Curated Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each piece is individually inspected, steam-pressed, and hand-selected for its pristine character and durability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1017] border border-slate-800 hover:border-[#d4a853]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-xl group-hover:scale-110 transition-transform">
              &#9827;
            </div>
            <h3 className="text-base font-bold text-white font-serif">Affordable Luxury</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designer and heritage finds at gentle prices that feel good. Authentic labels at up to 80% off original retail.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1017] border border-slate-800 hover:border-[#d4a853]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center text-[#d4a853] text-xl group-hover:scale-110 transition-transform">
              &#9788;
            </div>
            <h3 className="text-base font-bold text-white font-serif">One of a Kind</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No fast fashion clones — your look, your own. When you purchase a piece, it is immediately archived from the store.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED ITEMS ===================== */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
                Handpicked Drops
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Featured <em>Pieces</em>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCollections('all')}
              className="text-xs font-bold text-[#d4a853] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cleanPhone={cleanPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== WOMEN COLLECTION PREVIEW ===================== */}
      {womenProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
                Curated Pre-Loved
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Women&apos;s <em>Collection</em>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Dresses, designer blouses, knitwear, and tailoring in verified inspected condition.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCollections('women')}
              className="text-xs font-bold text-[#d4a853] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View All Women ({activeProducts.filter((p) => p.collection === 'women').length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {womenProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cleanPhone={cleanPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== MEN COLLECTION PREVIEW ===================== */}
      {menProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
                Gentlemen&apos;s Tailoring &amp; Vintage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Men&apos;s <em>Collection</em>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Trench coats, Oxford cotton shirts, Scottish lambswool jumpers, and waxed jackets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCollections('men')}
              className="text-xs font-bold text-[#d4a853] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View All Men ({activeProducts.filter((p) => p.collection === 'men').length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cleanPhone={cleanPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== ACCESSORIES PREVIEW ===================== */}
      {accessoriesProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
                Designer Leather &amp; Silk
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Bags &amp; <em>Accessories</em>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kate Spade luxury handbags, Burberry vintage silk scarves, and bridle leather belts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCollections('accessories')}
              className="text-xs font-bold text-[#d4a853] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View All Accessories ({activeProducts.filter((p) => p.collection === 'accessories').length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessoriesProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cleanPhone={cleanPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== KIDS COLLECTION PREVIEW ===================== */}
      {kidsProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-1">
                Organic &amp; Sustainable Playwear
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Kids&apos; <em>Collection</em>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Soft denim dungarees, quilted barn jackets, and Breton tops for little ones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCollections('kids')}
              className="text-xs font-bold text-[#d4a853] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View All Kids ({activeProducts.filter((p) => p.collection === 'kids').length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kidsProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cleanPhone={cleanPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== SUSTAINABLE MISSION BANNER ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#121622] via-[#0e1017] to-[#121622] border border-[#d4a853]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase">
              <Leaf className="w-3.5 h-3.5" />
              <span>London Sustainable Wardrobe Pledge</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">
              Giving Luxury Fashion a Second Life
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every item you purchase prevents valuable textiles from entering UK landfills and keeps classic garments in circulation. We hand-wash, ozone-sanitize, and steam-press each piece before dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateCollections('all')}
              className="px-6 py-3 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Browse All Pre-Loved
            </button>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Style & Class London, I want to sell or donate pre-loved items!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#181b26] hover:bg-[#25D366] text-slate-200 hover:text-black font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Sell Pre-Loved to Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Subcomponent for Product Card on Home
const ProductCard: React.FC<{
  product: Product;
  index?: number;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, size?: string) => void;
  onQuickView: (p: Product) => void;
  cleanPhone: string;
}> = ({ product, index, onSelectProduct, onAddToCart, onQuickView, cleanPhone }) => {
  const [imgIdx, setImgIdx] = useState(0);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev + 1) % product.images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const directWaMsg = `Hi Style & Class London! I want to order "${product.title}" (${product.code || product.sku}) priced at £${product.price.toFixed(2)}. Is it still available?`;
  const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(directWaMsg)}`;

  return (
    <motion.div
      onClick={() => onSelectProduct(product)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.45,
        delay: typeof index === 'number' ? (index % 4) * 0.07 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.985 }}
      className="group bg-[#0e1017] rounded-2xl border border-slate-800 hover:border-[#d4a853]/60 transition-colors shadow-md hover:shadow-2xl hover:shadow-[#d4a853]/10 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-black/60 overflow-hidden">
        <img
          src={product.images[imgIdx] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-[#d4a853] text-[10px] font-mono font-bold border border-[#d4a853]/40">
            {product.code || product.sku}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[9.5px] font-bold border border-emerald-500/40">
            {product.condition}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-full bg-black/80 text-slate-300 text-[10px] font-extrabold border border-slate-700">
            1-of-1
          </span>
        </div>

        {/* Carousel arrows */}
        {product.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
            >
              &#10094;
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
            >
              &#10095;
            </motion.button>
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute bottom-2.5 inset-x-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 bg-black/80 hover:bg-[#d4a853] text-white hover:text-black text-xs font-bold rounded-xl backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </motion.button>
        </div>
      </div>

      {/* Product Card Details */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#d4a853]">
              {product.brand || 'Designer Vintage'}
            </span>
            <span className="font-mono text-slate-400">
              {product.sizes[0] || '1 Size'}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#d4a853] transition-colors line-clamp-1">
            {product.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-white">£{product.price.toFixed(2)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-500 line-through">
                £{product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <motion.a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 transition-colors cursor-pointer"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </motion.a>

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="p-2 rounded-xl bg-[#d4a853] hover:bg-[#c29642] text-black font-bold transition-colors shadow-xs cursor-pointer"
              title="Add to Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
