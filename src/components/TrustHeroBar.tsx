import React from 'react';
import { Star, ShieldCheck, Lock, RotateCcw, Truck, Award } from 'lucide-react';

interface TrustHeroBarProps {
  onOpenReviews?: () => void;
  className?: string;
}

export const TrustHeroBar: React.FC<TrustHeroBarProps> = ({ onOpenReviews, className = '' }) => {
  return (
    <div className={`w-full bg-[#07080e] border-y border-[#d4a853]/25 py-2.5 px-4 text-xs ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        {/* Trust Item 1: Verified Reviews Rating */}
        <div 
          onClick={onOpenReviews}
          className="flex items-center gap-2 shrink-0 cursor-pointer group py-0.5"
          title="Click to view verified customer reviews"
        >
          <div className="flex items-center text-[#d4a853]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#d4a853] text-[#d4a853]" />
            ))}
          </div>
          <span className="font-extrabold text-white text-xs group-hover:text-[#d4a853] transition-colors">
            4.9 / 5.0
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            &middot; 184+ Verified UK Reviews
          </span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-slate-800 hidden md:inline-block shrink-0" aria-hidden="true" />

        {/* Trust Item 2: 256-Bit Bank-Grade SSL */}
        <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white text-[11px]">256-Bit SSL Security</span>
          <span className="text-slate-400 text-[10px] hidden lg:inline">&middot; Bank Encrypted</span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-slate-800 hidden md:inline-block shrink-0" aria-hidden="true" />

        {/* Trust Item 3: 14-Day Money-Back Guarantee */}
        <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
          <RotateCcw className="w-3.5 h-3.5 text-[#d4a853]" />
          <span className="font-bold text-white text-[11px]">14-Day Money-Back Guarantee</span>
          <span className="text-slate-400 text-[10px] hidden lg:inline">&middot; Hassle-Free Returns</span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-slate-800 hidden md:inline-block shrink-0" aria-hidden="true" />

        {/* Trust Item 4: Dispatch SLA */}
        <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
          <Truck className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-white text-[11px]">Tracked UK Dispatch</span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">&middot; Evri / InPost / Royal Mail</span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-slate-800 hidden xl:inline-block shrink-0" aria-hidden="true" />

        {/* Trust Item 5: Authenticity */}
        <div className="hidden xl:flex items-center gap-1.5 text-slate-300 shrink-0">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-white text-[11px]">100% Authentic 1-of-1 Pieces</span>
        </div>
      </div>
    </div>
  );
};
