import React from 'react';
import { ShoppingBag, Lock, Zap } from 'lucide-react';
import { Product } from '../../src/types';

interface StickyAddToCartProps {
  product: Product;
  onAddToCart: () => void;
  onFastBuy: () => void;
  currencySymbol?: string;
}

export const StickyAddToCart: React.FC<StickyAddToCartProps> = ({
  product,
  onAddToCart,
  onFastBuy,
  currencySymbol = '£'
}) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-md border-t border-slate-800 p-3 sm:hidden shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'}
            alt={product.title}
            className="w-11 h-11 object-cover rounded-xl border border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-[#d4a853] font-mono">
                {currencySymbol}{product.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                1-OF-1 PIECE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={onAddToCart}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white hover:border-[#d4a853] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={onFastBuy}
            className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c5953b] text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#d4a853]/20 disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Fast Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
