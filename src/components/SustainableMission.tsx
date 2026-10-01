import React from 'react';
import { RefreshCw, Leaf, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const SustainableMission: React.FC = () => {
  return (
    <section id="sustainable-mission" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-24">
      <div className="bg-[#12141d] border border-[#d4a853]/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        {/* Subtle decorative accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#d4a853]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left copy */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sustainable Circular Fashion</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-serif tracking-tight">
              Giving Extraordinary Clothes <span className="text-[#d4a853]">A Second Life</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              At <strong>Style And Class</strong>, we believe elegance shouldn't cost the Earth. Every item in our catalog is handpicked, professionally inspected, cleaned, and authenticated in London.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Fast fashion generates millions of tonnes of textile waste each year. By shopping our 1-of-1 pre-loved pieces, you are keeping garments out of landfills, celebrating vintage craftsmanship, and wearing distinct styles that nobody else in the room will have.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="bg-[#090a0f] border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#d4a853]" />
                Hand-Inspected &amp; Steam-Pressed
              </span>
              <span className="bg-[#090a0f] border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                100% Authentic Designer Pieces
              </span>
            </div>
          </div>

          {/* Right Trust Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#090a0f]/90 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#d4a853]/15 text-[#d4a853] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Unique 1-of-1 Inventory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you buy any item from our store, it is directly removed from the website so no one else can order it. You own a truly unique wardrobe staple.
              </p>
            </div>

            <div className="bg-[#090a0f]/90 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">7-Day UK Returns</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We want you to feel confident. If the size or style doesn't suit you, return it within 7 days in its original condition for a hassle-free refund.
              </p>
            </div>

            <div className="bg-[#090a0f]/90 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">PayPal UK &amp; WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay safely via PayPal UK with full buyer protection, or order directly via WhatsApp with our London dispatch manager.
              </p>
            </div>

            <div className="bg-[#090a0f]/90 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Community Care</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow our Instagram (@danmark.uk) and TikTok (@danmark.fashion5) for live drops, styling guides, and vintage London fashion insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
