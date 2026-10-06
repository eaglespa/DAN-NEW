import React, { useState } from 'react';
import { Plus, ShoppingBag, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  allProducts: Product[];
  onAddBundleToCart: (products: Product[], discountCode: string) => void;
  onSelectProduct: (product: Product) => void;
  currencySymbol?: string;
  className?: string;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  currentProduct,
  allProducts,
  onAddBundleToCart,
  onSelectProduct,
  currencySymbol = '£',
  className = ''
}) => {
  // Find a complementary in-stock product from another category
  const complementaryProduct = React.useMemo(() => {
    // Look for accessories, bags, or silk scarves first, or opposite gender/collection
    const available = allProducts.filter(
      p => p.id !== currentProduct.id && p.status !== 'sold' && p.stock > 0
    );

    // Prefer accessories / bags if available
    const accessory = available.find(
      p => p.collection === 'accessories' || p.category.toLowerCase().includes('bag') || p.category.toLowerCase().includes('scarf') || p.category.toLowerCase().includes('belt')
    );
    if (accessory) return accessory;

    // Fallback to any distinct piece
    return available[0] || null;
  }, [allProducts, currentProduct]);

  const [includeSecondary, setIncludeSecondary] = useState(true);
  const [bundleAdded, setBundleAdded] = useState(false);

  if (!complementaryProduct) return null;

  const rawTotal = currentProduct.price + (includeSecondary ? complementaryProduct.price : 0);
  const discountRate = includeSecondary ? 0.15 : 0; // 15% Bundle Discount
  const savings = includeSecondary ? rawTotal * discountRate : 0;
  const bundleFinalPrice = rawTotal - savings;

  const handleAddBundle = () => {
    const bundleItems = includeSecondary ? [currentProduct, complementaryProduct] : [currentProduct];
    onAddBundleToCart(bundleItems, 'BUNDLE15');
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2400);
  };

  return (
    <div className={`p-5 sm:p-6 bg-gradient-to-br from-[#12141f] via-[#0f111a] to-[#181510] border-2 border-[#d4a853]/40 rounded-3xl shadow-xl space-y-5 my-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/30">
            <Sparkles className="w-4 h-4 text-[#d4a853]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-serif tracking-tight">
              Complete the Look &middot; Frequently Bought Together
            </h3>
            <p className="text-[11px] text-slate-300">
              Curated London pairing &middot; Save an extra 15% when purchased as a bundle
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Tag className="w-3 h-3 text-amber-400" />
          <span>Save 15% Bundle Offer</span>
        </span>
      </div>

      {/* Visual Product Pair */}
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        {/* Item 1: Current Product */}
        <div className="flex items-center gap-3 bg-[#0a0c14] p-3 rounded-2xl border border-slate-800 flex-1 w-full">
          <img
            src={currentProduct.images[0]}
            alt={currentProduct.title}
            className="w-16 h-20 object-cover rounded-xl border border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#d4a853] font-bold uppercase tracking-wider block truncate">
              {currentProduct.brand || 'This Piece'}
            </span>
            <h4 className="text-xs font-black text-white truncate" title={currentProduct.title}>
              {currentProduct.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-[#d4a853]">
                {currencySymbol}{currentProduct.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {currentProduct.sizes[0] || 'Standard'}
              </span>
            </div>
          </div>
        </div>

        {/* Plus Symbol */}
        <div className="w-8 h-8 rounded-full bg-[#181a26] border border-[#d4a853]/40 flex items-center justify-center text-[#d4a853] font-black shrink-0">
          <Plus className="w-4 h-4" />
        </div>

        {/* Item 2: Complementary Product */}
        <div className="flex items-center gap-3 bg-[#0a0c14] p-3 rounded-2xl border border-slate-800 flex-1 w-full">
          <img
            src={complementaryProduct.images[0]}
            alt={complementaryProduct.title}
            onClick={() => onSelectProduct(complementaryProduct)}
            className="w-16 h-20 object-cover rounded-xl border border-slate-700 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-[#d4a853] font-bold uppercase tracking-wider truncate">
                {complementaryProduct.brand || 'Perfect Match'}
              </span>
              <label className="flex items-center gap-1 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={includeSecondary}
                  onChange={(e) => setIncludeSecondary(e.target.checked)}
                  className="rounded border-slate-700 text-[#d4a853] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>
            </div>
            <h4
              onClick={() => onSelectProduct(complementaryProduct)}
              className="text-xs font-black text-white hover:text-[#d4a853] transition-colors truncate cursor-pointer"
              title={complementaryProduct.title}
            >
              {complementaryProduct.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-[#d4a853]">
                {currencySymbol}{complementaryProduct.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {complementaryProduct.sizes[0] || '1-of-1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & 1-Click Action */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 font-bold">Bundle Price:</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {currencySymbol}{bundleFinalPrice.toFixed(2)}
            </span>
            {includeSecondary && (
              <>
                <span className="text-xs text-slate-500 line-through font-mono">
                  {currencySymbol}{rawTotal.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400 font-extrabold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Save {currencySymbol}{savings.toFixed(2)} (15% OFF)
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Both pieces qualify for Free Tracked UK Delivery
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleAddBundle}
          className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c29642] hover:brightness-110 active:scale-98 text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {bundleAdded ? (
            <>
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Bundle Added to Bag!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>
                {includeSecondary
                  ? `Add Both to Bag (Save ${currencySymbol}${savings.toFixed(2)})`
                  : 'Add Single Item to Bag'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
