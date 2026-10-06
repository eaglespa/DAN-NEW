import React, { useState } from 'react';
import { ShoppingBag, Lock, Check, CreditCard, Sparkles } from 'lucide-react';
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
  const [justAdded, setJustAdded] = useState(false);
  const isSold = product.stock <= 0 || product.status === 'sold' || product.status === 'archived';

  const handleMobileAddToCart = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSold) return;

    // Mobile micro-haptics
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch (_) {}

    onAddToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleMobileInstantBuy = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSold) return;

    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } catch (_) {}

    onBuyWithPayPal();
  };

  return (
    <div 
      id="mobile-sticky-add-to-cart"
      style={{ touchAction: 'manipulation' }}
      className="fixed bottom-0 inset-x-0 z-30 bg-[#0c0e17]/95 backdrop-blur-md border-t-2 border-[#d4a853]/40 py-2.5 px-3 sm:px-6 shadow-2xl transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Product thumb & title (visible on all screens, compact on mobile) */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[45%] sm:max-w-xs shrink-0">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-slate-700 shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate leading-tight">
              {product.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
              <span className="font-black text-[#d4a853] font-mono">
                {currencySymbol}{product.price.toFixed(2)}
              </span>
              <span className="text-slate-500 hidden xs:inline">•</span>
              <span className="text-slate-400 font-bold hidden xs:inline truncate text-[10px]">
                {selectedSize || product.sizes[0] || '1-of-1'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: 52px high touch target on mobile */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {isSold ? (
            <div className="w-full sm:w-auto h-12 px-5 bg-red-950/80 border border-red-700 text-red-300 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md">
              <Lock className="w-4 h-4 text-red-400" />
              <span>SOLD OUT</span>
            </div>
          ) : (
            <>
              {/* Primary Add to Bag: Responsive, min 48px touch target */}
              <button
                id="sticky-mobile-add-to-cart-btn"
                type="button"
                onClick={handleMobileAddToCart}
                onTouchEnd={handleMobileAddToCart}
                style={{ touchAction: 'manipulation', minHeight: '48px' }}
                className="flex-1 sm:flex-initial h-12 px-4 sm:px-6 bg-[#d4a853] hover:bg-[#e8c97a] active:scale-95 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span className="font-black">Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-black shrink-0" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Instant Buy with Card / PayPal: 48px touch target */}
              <button
                id="sticky-mobile-buy-now-btn"
                type="button"
                onClick={handleMobileInstantBuy}
                onTouchEnd={handleMobileInstantBuy}
                style={{ touchAction: 'manipulation', minHeight: '48px' }}
                className="hidden xs:flex h-12 px-4 sm:px-5 bg-[#181b28] hover:bg-[#222638] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all items-center justify-center gap-1.5 border border-[#d4a853]/50 cursor-pointer select-none shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
