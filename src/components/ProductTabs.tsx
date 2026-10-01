import React, { useState } from 'react';
import { Star, ShieldCheck, Check, Truck, RefreshCw, ThumbsUp, Sparkles, Tag } from 'lucide-react';
import { Product } from '../types';
import { INITIAL_REVIEWS } from '../data/initialProducts';

interface ProductTabsProps {
  product: Product;
  currencySymbol: string;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product, currencySymbol }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>('description');
  const [helpfulCount, setHelpfulCount] = useState<Record<string, number>>({});

  const handleHelpful = (id: string) => {
    setHelpfulCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="w-full mt-14 pt-8 border-t border-slate-800">
      {/* Segmented Tab Header */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-[#13151f] rounded-2xl border border-slate-800 max-w-full overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'description'
                ? 'bg-[#d4a853] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Garment Highlights
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#d4a853] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inspection &amp; Specs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-[#d4a853] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            UK Shipping &amp; 7-Day Returns
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#d4a853] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Customer Reviews</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'reviews' ? 'bg-black text-[#d4a853]' : 'bg-slate-800 text-slate-300'}`}>
              {product.reviewCount}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Description */}
      {activeTab === 'description' && (
        <div className="space-y-8 max-w-4xl mx-auto text-slate-300 leading-relaxed text-sm text-left">
          <div className="bg-[#13151f] p-6 sm:p-8 rounded-3xl border border-[#d4a853]/20 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-[#d4a853] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Authentic London Pre-Loved Selection</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-serif">
              {product.title} &middot; {product.brand || 'Designer'} [{product.code || 'Curated'}]
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(product.bulletPoints || []).map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#13151f] border border-slate-800 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-[#d4a853]/15 text-[#d4a853] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <Check className="w-4 h-4 text-[#d4a853]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{feat}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspected by Style &amp; Class garment specialists in London.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Specs */}
      {activeTab === 'specs' && (
        <div className="max-w-3xl mx-auto text-left">
          <div className="rounded-3xl border border-slate-800 overflow-hidden bg-[#13151f] shadow-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-slate-800">
                {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-[#0f1118]' : 'bg-[#13151f]'}>
                    <td className="py-3.5 px-5 font-bold text-[#d4a853] w-1/3">
                      {key}
                    </td>
                    <td className="py-3.5 px-5 text-slate-200">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: UK Shipping & Returns */}
      {activeTab === 'shipping' && (
        <div id="faq-section" className="max-w-3xl mx-auto space-y-4 text-xs sm:text-sm text-left">
          <div className="p-6 rounded-3xl bg-[#13151f] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-white font-bold text-base">
              <Truck className="w-5 h-5 text-[#d4a853]" />
              <span>United Kingdom Tracked Carriers</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              All pre-loved items are safely packaged in sustainable mailers and dispatched within 24 hours from London. You can select your preferred UK courier during checkout:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#090a0f] p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-white block">Evri Standard</span>
                <span className="text-xs text-[#d4a853] font-bold">£2.60</span>
                <p className="text-[11px] text-slate-400 mt-1">2-3 business days tracked delivery.</p>
              </div>
              <div className="bg-[#090a0f] p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-white block">InPost Locker / Shop</span>
                <span className="text-xs text-[#d4a853] font-bold">£2.89</span>
                <p className="text-[11px] text-slate-400 mt-1">Convenient 24/7 parcel locker pickup.</p>
              </div>
              <div className="bg-[#090a0f] p-3.5 rounded-xl border border-slate-800">
                <span className="font-bold text-white block">Royal Mail 48 Tracked</span>
                <span className="text-xs text-[#d4a853] font-bold">£3.65</span>
                <p className="text-[11px] text-slate-400 mt-1">Trusted nationwide postal delivery.</p>
              </div>
            </div>
            <p className="text-xs text-[#d4a853] font-bold pt-1">
              &starf; Free standard UK delivery on all combined orders over £45.00!
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#13151f] border border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-white font-bold text-base">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>7-Day UK Returns Guarantee</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We want you to love your pre-loved find. If the fit or style doesn't match your expectations, you may return the item within <strong>7 days</strong> of delivery in its original, unworn condition for a prompt refund.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Reviews */}
      {activeTab === 'reviews' && (
        <div id="reviews-section" className="max-w-4xl mx-auto space-y-8 text-left">
          {/* Rating Summary Block */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181a24] to-[#10121a] border border-[#d4a853]/30 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[#d4a853] font-serif">
                {product.rating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center sm:justify-start text-[#d4a853] my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#d4a853] text-[#d4a853]" />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Based on {product.reviewCount} customer reviews across the UK
              </p>
            </div>

            {/* Rating Bars */}
            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              {[
                { stars: '5★', pct: 92 },
                { stars: '4★', pct: 8 },
                { stars: '3★', pct: 0 },
                { stars: '2★', pct: 0 },
                { stars: '1★', pct: 0 }
              ].map(b => (
                <div key={b.stars} className="flex items-center gap-2">
                  <span className="w-6 font-bold text-slate-400">{b.stars}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#d4a853] rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-mono text-[11px]">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews List */}
          <div className="space-y-4">
            {INITIAL_REVIEWS.map(rev => {
              const helpful = (helpfulCount[rev.id] || 0) + (rev.verified ? 5 : 2);

              return (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#13151f] border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#181a24] border border-slate-700 text-[#d4a853] font-black text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{rev.author}</span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[10.5px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.2 rounded-full border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Verified UK Buyer</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{rev.date} &middot; {rev.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-[#d4a853]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#d4a853] text-[#d4a853]' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h5 className="font-extrabold text-white text-sm">
                    "{rev.title}"
                  </h5>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
                    <span>Purchased: {rev.variantPurchased}</span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({helpful})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
