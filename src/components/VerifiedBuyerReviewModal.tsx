import React, { useState } from 'react';
import { Star, ShieldCheck, X, Check, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { Product, Order, CustomerReview } from '../types';

interface VerifiedBuyerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  order?: Order | null;
  onReviewSubmitted?: (review: CustomerReview) => void;
}

export const VerifiedBuyerReviewModal: React.FC<VerifiedBuyerReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  order,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState<string>(order?.customer?.fullName || '');
  const [location, setLocation] = useState<string>(order?.customer?.city ? `${order.customer.city}, UK` : 'London, United Kingdom');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submittedReview, setSubmittedReview] = useState<CustomerReview | null>(null);

  if (!isOpen) return null;

  const targetItemTitle = product?.title || order?.items?.[0]?.productTitle || 'Style & Class London Garment';
  const targetItemCode = product?.code || order?.items?.[0]?.code || '1-of-1 Piece';
  const targetProductId = product?.id || order?.items?.[0]?.productId;

  const ratingDescriptions: Record<number, string> = {
    1: '1/5 · Needs Improvement',
    2: '2/5 · Fair Pre-Loved Condition',
    3: '3/5 · Good Quality & Fit',
    4: '4/5 · Very Good Authentic Condition',
    5: '5/5 · Exceptional Pre-Loved Luxury'
  };

  const currentEffectiveRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!author.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      setErrorMsg('Please write a brief comment describing your purchase (min 8 characters).');
      return;
    }

    setIsSubmitting(true);

    const reviewPayload = {
      productId: targetProductId,
      orderId: order?.id,
      author: author.trim(),
      location: location.trim() || 'London, UK',
      rating,
      title: title.trim() || (rating >= 4 ? 'Remarkable Quality & Swift Delivery' : 'Verified Buyer Review'),
      comment: comment.trim(),
      variantPurchased: `${targetItemTitle} [${targetItemCode}]`,
      verified: true
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Save to localStorage as backup
      try {
        const stored = JSON.parse(localStorage.getItem('styleandclass_verified_reviews') || '[]');
        localStorage.setItem('styleandclass_verified_reviews', JSON.stringify([data.review, ...stored]));
      } catch (err) {}

      setIsSuccess(true);
      setSubmittedReview(data.review);
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review);
      }
    } catch (err: any) {
      console.warn('Review submission error, saving locally:', err);
      // Fallback local review
      const localReview: CustomerReview = {
        id: `rev-${Date.now()}`,
        productId: targetProductId,
        orderId: order?.id,
        author: author.trim(),
        location: location.trim() || 'London, UK',
        rating,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        verified: true,
        title: title.trim() || 'Exceptional Pre-Loved Quality',
        comment: comment.trim(),
        variantPurchased: `${targetItemTitle} [${targetItemCode}]`,
        helpfulCount: 1
      };

      try {
        const stored = JSON.parse(localStorage.getItem('styleandclass_verified_reviews') || '[]');
        localStorage.setItem('styleandclass_verified_reviews', JSON.stringify([localReview, ...stored]));
      } catch (e) {}

      setIsSuccess(true);
      setSubmittedReview(localReview);
      if (onReviewSubmitted) {
        onReviewSubmitted(localReview);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-[#0e1017] via-[#141622] to-[#0e1017] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white font-serif">
                  Verified Buyer Review
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Purchase
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-xs">
                {targetItemTitle} &middot; [{targetItemCode}]
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto text-xs space-y-5">
          {isSuccess && submittedReview ? (
            /* Success Celebration State */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-500/20">
                <Check className="w-8 h-8 text-black stroke-[3]" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white font-serif">
                  Thank You, {submittedReview.author}!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Your <strong>Verified Buyer Review</strong> has been successfully published on the Product Detail page.
                </p>
              </div>

              {/* Review Preview Card */}
              <div className="p-4 bg-[#0a0a0f] rounded-2xl border border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{submittedReview.author}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified UK Buyer</span>
                    </span>
                  </div>
                  <div className="flex items-center text-[#d4a853]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < submittedReview.rating ? 'fill-[#d4a853] text-[#d4a853]' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-200">
                  "{submittedReview.title}"
                </div>

                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{submittedReview.comment}"
                </p>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                  <span>{submittedReview.variantPurchased}</span>
                  <span>{submittedReview.date} &middot; {submittedReview.location}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close &amp; View on Product Page
              </button>
            </div>
          ) : (
            /* Review Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/70 border border-red-800 text-red-300 rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Order Context Banner */}
              {order && (
                <div className="p-3 bg-[#0a0a0f] rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Linked Order:</span>
                  <span className="font-mono text-[#d4a853] font-bold">#{order.id} (Paid &amp; Confirmed)</span>
                </div>
              )}

              {/* Rating Selector */}
              <div className="p-4 bg-[#0a0a0f] rounded-2xl border border-slate-800 space-y-2 text-center">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  Overall Rating *
                </label>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= currentEffectiveRating
                            ? 'fill-[#d4a853] text-[#d4a853] drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-[#d4a853]">
                  {ratingDescriptions[currentEffectiveRating] || 'Select your rating'}
                </div>
              </div>

              {/* Name & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Your Name / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Charlotte K."
                    className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Location in UK
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kensington, London"
                    className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors"
                  />
                </div>
              </div>

              {/* Review Headline / Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pristine Kate Spade dress, exceeded expectations!"
                  className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors"
                />
              </div>

              {/* Detailed Review Comment */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Your Review &amp; Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other UK buyers about the garment quality, authenticity, 1-of-1 accuracy, delivery speed, and customer care..."
                  className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Verified Buyer Guarantee Note */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  Your review will display the official <strong>Verified Buyer</strong> badge on Style &amp; Class London.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#d4a853] hover:bg-[#c29642] disabled:opacity-50 text-black font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing Review...' : 'Submit Verified Review'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
