import React, { useState } from 'react';
import { ShieldCheck, Lock, RotateCcw, Award, CheckCircle2, X, ExternalLink, HelpCircle } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'compact' | 'full' | 'checkout';
  className?: string;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ variant = 'full', className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {/* Core Trust Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Badge 1: 256-Bit SSL */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-[#0d0f17] border border-slate-800 hover:border-[#d4a853]/60 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate group-hover:text-[#d4a853] transition-colors">
                256-Bit SSL
              </span>
              <span className="text-[9.5px] text-slate-400 block truncate">
                Bank-Grade Security
              </span>
            </div>
          </div>

          {/* Badge 2: 14-Day Money-Back Guarantee */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-[#0d0f17] border border-slate-800 hover:border-[#d4a853]/60 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-[#d4a853]/10 text-[#d4a853] group-hover:scale-105 transition-transform shrink-0">
              <RotateCcw className="w-4 h-4 text-[#d4a853]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate group-hover:text-[#d4a853] transition-colors">
                14-Day Guarantee
              </span>
              <span className="text-[9.5px] text-slate-400 block truncate">
                Money-Back Returns
              </span>
            </div>
          </div>

          {/* Badge 3: 100% Authenticity Verified */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-[#0d0f17] border border-slate-800 hover:border-[#d4a853]/60 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate group-hover:text-[#d4a853] transition-colors">
                100% Authentic
              </span>
              <span className="text-[9.5px] text-slate-400 block truncate">
                Inspected in London
              </span>
            </div>
          </div>

          {/* Badge 4: Verified UK Merchant */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-[#0d0f17] border border-slate-800 hover:border-[#d4a853]/60 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block truncate group-hover:text-[#d4a853] transition-colors">
                Verified Merchant
              </span>
              <span className="text-[9.5px] text-slate-400 block truncate">
                UK Registered Store
              </span>
            </div>
          </div>
        </div>

        {/* Certified Payment Gateways Strip */}
        <div className="p-3 bg-[#090b12] border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-extrabold text-slate-300">
              Guaranteed Safe &amp; Encrypted Checkout
            </span>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-[#141724] border border-slate-700/60 rounded text-[10px] font-black text-slate-200">
              Apple Pay
            </span>
            <span className="px-2 py-0.5 bg-[#141724] border border-slate-700/60 rounded text-[10px] font-black text-slate-200">
              Google Pay
            </span>
            <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-700/60 rounded text-[10px] font-black text-blue-300">
              VISA
            </span>
            <span className="px-2 py-0.5 bg-amber-900/40 border border-amber-700/60 rounded text-[10px] font-black text-amber-300">
              Mastercard
            </span>
            <span className="px-2 py-0.5 bg-cyan-900/40 border border-cyan-700/60 rounded text-[10px] font-black text-cyan-300">
              AMEX
            </span>
            <span className="px-2 py-0.5 bg-[#003087]/40 border border-[#0079C1]/60 rounded text-[10px] font-black text-[#0079C1]">
              PayPal
            </span>
            <span className="px-2 py-0.5 bg-pink-900/30 border border-pink-700/60 rounded text-[10px] font-black text-pink-300">
              Klarna
            </span>
            <span className="px-2 py-0.5 bg-teal-900/30 border border-teal-700/60 rounded text-[10px] font-black text-teal-300">
              Clearpay
            </span>
          </div>
        </div>
      </div>

      {/* Security & Guarantees Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl border border-[#d4a853]/40 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-[#0a0c14] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-serif">
                    Style &amp; Class Buyer Protection
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    London Curated Luxury · 100% Secure Shopping
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Guarantee 1 */}
              <div className="p-3.5 bg-[#0c0e17] rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>256-Bit Bank-Grade SSL Data Protection</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Your credit/debit card data is processed directly via TLS 1.3 / 256-Bit bank-grade encrypted channels. We never store raw card numbers, ensuring zero breach exposure.
                </p>
              </div>

              {/* Guarantee 2 */}
              <div className="p-3.5 bg-[#0c0e17] rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-[#d4a853] font-extrabold text-xs">
                  <RotateCcw className="w-4 h-4" />
                  <span>14-Day Hassle-Free Money-Back Guarantee</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  If your pre-loved piece does not fit or match your expectations, return it within 14 days of receipt for an immediate, full refund.
                </p>
              </div>

              {/* Guarantee 3 */}
              <div className="p-3.5 bg-[#0c0e17] rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                  <Award className="w-4 h-4" />
                  <span>100% Authenticity Guarantee &amp; Inspection</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every 1-of-1 vintage garment is physically inspected in our London studio for fabric integrity, immaculate stitching, and authentic brand labels before being steam-pressed and packaged.
                </p>
              </div>

              {/* Guarantee 4 */}
              <div className="p-3.5 bg-[#0c0e17] rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fully Tracked UK Courier Delivery</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Dispatched within 24 hours with scannable barcode logistics via Evri, InPost 24/7 Lockers, or Royal Mail 48 Tracked with full transit insurance.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  Understood &amp; Return to Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
