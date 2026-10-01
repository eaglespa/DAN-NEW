import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface StickyAddToCartProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onAddToCart: () => void;
  onBuyWithPayPal: () => void;
  currencySymbol: string;
}

export const StickyAddToCart: React.FC<StickyAddToCartProps> = ({
  product,
  selectedColor,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onBuyWithPayPal,
  currencySymbol
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 shadow-2xl transition-transform">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Product thumb & title */}
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-11 h-11 object-cover rounded-xl border border-slate-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-950 truncate">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-black text-slate-950">
                {currencySymbol}{product.price.toFixed(2)}
              </span>
              <span>•</span>
              <span>{selectedColor}</span>
              <span>•</span>
              <span className="font-bold text-slate-900">{selectedSize}</span>
            </div>
          </div>
        </div>

        {/* Size Quick Picker */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[240px] sm:max-w-xs scrollbar-none py-1">
          {product.sizes.slice(0, 6).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => onSelectSize(sz)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap transition-colors ${
                selectedSize === sz
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onAddToCart}
            className="px-4 py-2 bg-slate-950 hover:bg-black active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>

          <button
            type="button"
            onClick={onBuyWithPayPal}
            className="hidden xs:flex px-4 py-2 bg-[#FFC439] hover:bg-[#F2BA36] active:scale-98 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all items-center gap-1 border border-[#E0A820]"
          >
            <span className="italic font-bold text-[#003087]">PayPal</span>
            <span>UK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
