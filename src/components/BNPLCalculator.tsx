import React, { useState } from 'react';
import { CreditCard, HelpCircle, X, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface BNPLCalculatorProps {
  price: number;
  currencySymbol?: string;
  className?: string;
}

export const BNPLCalculator: React.FC<BNPLCalculatorProps> = ({
  price,
  currencySymbol = '£',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const installment = (price / 3).toFixed(2);

  return (
    <>
      <div className={`p-3 bg-[#0a0c14] border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-950/40 border border-pink-700/50 text-pink-300 font-black text-[10px] tracking-wider uppercase">
            Pay in 3
          </div>
          <div className="text-[11px] text-slate-300 leading-snug">
            Or <strong className="text-white">3 interest-free</strong> payments of{' '}
            <strong className="text-[#d4a853]">{currencySymbol}{installment}</strong> with{' '}
            <span className="font-extrabold text-pink-300">Klarna</span> or{' '}
            <span className="font-black text-[#0079C1]">PayPal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer font-bold"
        >
          Learn more
        </button>
      </div>

      {/* BNPL Explainer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#13151f] text-white w-full max-w-md rounded-3xl border border-[#d4a853]/40 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-[#0a0c14] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4a853]" />
                <h3 className="text-sm font-black text-white font-serif">
                  Buy Now, Pay in 3 Interest-Free Installments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Split your purchase of <strong>{currencySymbol}{price.toFixed(2)}</strong> into 3 equal monthly payments with zero interest and zero hidden fees.
              </p>

              {/* Installment breakdown steps */}
              <div className="space-y-2 border-y border-slate-800/80 py-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090b12] border border-slate-800">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#d4a853] text-black font-black text-[10px] flex items-center justify-center">1</span>
                    Today (At Order Dispatch)
                  </span>
                  <span className="font-black text-[#d4a853]">{currencySymbol}{installment}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090b12] border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">2</span>
                    In 30 Days
                  </span>
                  <span className="font-bold text-white">{currencySymbol}{installment}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090b12] border border-slate-800">
                  <span className="font-bold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">3</span>
                    In 60 Days
                  </span>
                  <span className="font-bold text-white">{currencySymbol}{installment}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>0% Interest · No Annual or Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Instant Decision at Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Full Buyer Protection with 14-Day Guarantee</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  Select at Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
