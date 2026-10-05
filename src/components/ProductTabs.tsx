import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Check, Truck, RefreshCw, ThumbsUp, Sparkles, Tag, PlusCircle, MessageSquare } from 'lucide-react';
import { Product, CustomerReview } from '../types';
import { INITIAL_REVIEWS } from '../data/initialProducts';
import { VerifiedBuyerReviewModal } from './VerifiedBuyerReviewModal';

interface ProductTabsProps {
  product: Product;
  currencySymbol: string;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product, currencySymbol }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>('description');
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [helpfulCount, setHelpfulCount] = useState<Record<string, number>>({});
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | '5stars' | 'verified'>('all');

  // Load reviews on mount and when product changes
  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        if (res.ok) {
          const serverReviews: CustomerReview[] = await res.json();
          if (isMounted && Array.isArray(serverReviews) && serverReviews.length > 0) {
            // Merge with local storage reviews
            const localSaved: CustomerReview[] = JSON.parse(localStorage.getItem('styleandclass_verified_reviews') || '[]');
            const combinedMap = new Map<string, CustomerReview>();

            // Put initial reviews first
            INITIAL_REVIEWS.forEach(r => combinedMap.set(r.id, r));
            serverReviews.forEach(r => combinedMap.set(r.id, r));
            localSaved.forEach(r => combinedMap.set(r.id, r));

            setReviews(Array.from(combinedMap.values()));
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load server reviews, using fallback:', err);
      }

      // Local fallback
      try {
        const localSaved: CustomerReview[] = JSON.parse(localStorage.getItem('styleandclass_verified_reviews') || '[]');
        const combinedMap = new Map<string, CustomerReview>();
        INITIAL_REVIEWS.forEach(r => combinedMap.set(r.id, r));
        localSaved.forEach(r => combinedMap.set(r.id, r));
        if (isMounted) {
          setReviews(Array.from(combinedMap.values()));
        }
      } catch (e) {}
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleHelpful = async (id: string) => {
    setHelpfulCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    try {
      await fetch(`/api/reviews/${id}/helpful`, { method: 'POST' });
    } catch (e) {}
  };

  const handleNewReview = (newRev: CustomerReview) => {
    setReviews(prev => [newRev, ...prev.filter(r => r.id !== newRev.id)]);
  };

  // Calculate dynamic rating and distributions
  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === '5stars') return r.rating === 5;
    if (reviewFilter === 'verified') return r.verified;
    return true;
  });

  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
    : product.rating.toFixed(1);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

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
              {totalReviewsCount}
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
                <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Specifications */}
      {activeTab === 'specs' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="bg-[#13151f] rounded-3xl border border-slate-800 overflow-hidden shadow-lg p-6 sm:p-8">
            <h4 className="text-base sm:text-lg font-black text-white font-serif mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#d4a853]" />
              <span>Individual Garment Inspection &amp; Measurement Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs sm:text-sm">
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Designer / Brand:</span>
                <span className="font-bold text-white">{product.brand || 'Designer'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Item / Box Code:</span>
                <span className="font-bold font-mono text-[#d4a853]">{product.code || product.sku}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Condition Grade:</span>
                <span className="font-bold text-emerald-400">{product.condition || 'Excellent'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">UK Tag Size:</span>
                <span className="font-bold text-white">{product.sizes?.[0] || 'Standard Fit'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Primary Color:</span>
                <span className="font-bold text-white">{product.colors?.[0]?.name || 'Natural'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Stock Availability:</span>
                <span className="font-bold text-[#d4a853]">Only 1 Piece (Unique 1-of-1)</span>
              </div>
              {product.material && (
                <div className="flex justify-between py-2.5 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Fabric / Material:</span>
                  <span className="font-bold text-white">{product.material}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Shipping & Returns */}
      {activeTab === 'shipping' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#13151f] p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-black text-white text-sm">Evri Standard (£2.60)</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                2 to 3 Business Days door-to-door tracked delivery across England, Scotland, Wales &amp; NI.
              </p>
            </div>

            <div className="bg-[#13151f] p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-black text-white text-sm">InPost Locker (£2.89)</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eco-friendly 24/7 locker pickup. Safe contactless pickup within 48 hours of dispatch.
              </p>
            </div>

            <div className="bg-[#13151f] p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-black text-white text-sm">Royal Mail 48 Tracked (£3.65)</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fast priority delivery via your local postie with full SMS and email delivery updates.
              </p>
            </div>
          </div>

          <div className="p-6 bg-[#13151f] rounded-2xl border border-slate-800 space-y-2 text-xs">
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

      {/* Tab 4: Customer Reviews (Verified Buyer Component) */}
      {activeTab === 'reviews' && (
        <div id="reviews-section" className="max-w-4xl mx-auto space-y-8 text-left">
          {/* Rating Summary Block & Action */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181a24] to-[#10121a] border border-[#d4a853]/30 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            {/* Left: Big Average */}
            <div className="text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[#d4a853] font-serif">
                {avgRating}
              </div>
              <div className="flex items-center justify-center sm:justify-start text-[#d4a853] my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(avgRating)) ? 'fill-[#d4a853] text-[#d4a853]' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Based on {totalReviewsCount} customer reviews across the UK
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Authenticated Pre-Loved Pieces</span>
              </div>
            </div>

            {/* Middle: Rating Bars */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starCounts[stars] || 0;
                const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-400">{stars}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#d4a853] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-mono text-[11px]">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Right: Write Review Trigger */}
            <div className="text-center md:text-right shrink-0">
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(true)}
                className="py-3 px-5 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write a Verified Review</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                Share feedback on your 1-of-1 purchase
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-[#d4a853] text-black'
                    : 'bg-[#181a24] text-slate-400 hover:text-white'
                }`}
              >
                All Reviews ({totalReviewsCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('5stars')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  reviewFilter === '5stars'
                    ? 'bg-[#d4a853] text-black'
                    : 'bg-[#181a24] text-slate-400 hover:text-white'
                }`}
              >
                5 Stars Only ({starCounts[5] || 0})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('verified')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  reviewFilter === 'verified'
                    ? 'bg-[#d4a853] text-black'
                    : 'bg-[#181a24] text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Buyers</span>
              </button>
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              Showing {filteredReviews.length} of {totalReviewsCount}
            </span>
          </div>

          {/* Customer Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-[#13151f] rounded-2xl border border-slate-800 space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs">No reviews match the selected filter.</p>
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="px-4 py-2 bg-[#d4a853] text-black text-xs font-bold rounded-xl cursor-pointer"
                >
                  Be the first to review
                </button>
              </div>
            ) : (
              filteredReviews.map(rev => {
                const helpful = (helpfulCount[rev.id] || 0) + (rev.helpfulCount || (rev.verified ? 6 : 2));

                return (
                  <div
                    key={rev.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#13151f] border border-slate-800 space-y-3 transition-all hover:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#181a24] border border-slate-700 text-[#d4a853] font-black text-xs flex items-center justify-center">
                          {rev.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{rev.author}</span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Verified UK Buyer</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {rev.date} &middot; {rev.location}
                          </p>
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

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {rev.comment}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80">
                      <span className="font-mono text-[11px]">
                        Purchased: {rev.variantPurchased}
                      </span>
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
              })
            )}
          </div>
        </div>
      )}

      {/* Review Submission Modal Component */}
      <VerifiedBuyerReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        product={product}
        onReviewSubmitted={handleNewReview}
      />
    </div>
  );
};
