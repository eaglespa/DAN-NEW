import React from 'react';
import { Star, Truck, ShieldCheck, RefreshCw, MessageCircle, AlertTriangle, CheckCircle2, Ruler, Flame, Clock, Tag, CreditCard } from 'lucide-react';
import { Product } from '../types';

interface ProductInfoProps {
  product: Product;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyWithPayPal: () => void;
  onBuyWithCard?: () => void;
  onOrderViaWhatsApp: () => void;
  onOpenSizeGuide: () => void;
  currencySymbol: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyWithPayPal,
  onBuyWithCard,
  onOrderViaWhatsApp,
  onOpenSizeGuide,
  currencySymbol
}) => {
  const discountAmount = product.compareAtPrice - product.price;
  const discountPercent = product.compareAtPrice > product.price
    ? Math.round((discountAmount / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 w-full text-left">
      {/* Category, Brand & Item Code Banner */}
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {product.code && (
            <span className="bg-[#181a24] text-[#f5c469] font-mono font-bold px-2.5 py-1 rounded-md border border-[#d4a853]/40 text-xs shadow-xs">
              {product.code}
            </span>
          )}
          <span className="text-[#d4a853] uppercase tracking-widest font-black text-xs">
            {product.brand || 'Designer'}
          </span>
          <span className="text-slate-400">&middot;</span>
          <span className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
            {product.category}
          </span>
        </div>

        {/* Condition Tag */}
        {product.condition && (
          <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
            <Tag className="w-3 h-3 text-emerald-400" />
            <span>Condition: {product.condition}</span>
          </div>
        )}
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight font-serif">
          {product.title}
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Catalog Ref: <span className="font-semibold text-slate-300">{product.code || product.sku}</span> &middot; Inspected in London &middot; Steam-Pressed
        </p>
      </div>

      {/* Rating & Verified Reviews Badge */}
      <div className="flex items-center gap-3">
        <a href="#reviews-section" className="flex items-center gap-1.5 group cursor-pointer">
          <div className="flex items-center text-[#d4a853]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#d4a853] text-[#d4a853]" />
            ))}
          </div>
          <span className="text-sm font-extrabold text-white">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 group-hover:text-white underline underline-offset-2">
            ({product.reviewCount} UK verified reviews)
          </span>
        </a>

        <span className="text-slate-600">&bull;</span>

        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          &check; Authenticity Verified
        </span>
      </div>

      {/* Price & Savings Pill */}
      <div className="p-4 rounded-2xl bg-[#13151f] border border-[#d4a853]/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-[#d4a853] tracking-tight">
            {currencySymbol}{product.price.toFixed(2)}
          </span>
          {product.compareAtPrice > product.price && (
            <span className="text-base sm:text-lg text-slate-500 line-through font-semibold">
              {currencySymbol}{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="flex items-center gap-1.5 bg-[#d4a853] text-black font-black text-xs px-3 py-1 rounded-full shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>SAVE {currencySymbol}{discountAmount.toFixed(2)} ({discountPercent}% OFF)</span>
          </div>
        )}
      </div>

      {/* 1-Piece / Inventory Automation Notice (CRITICAL MANDATE) */}
      <div className="p-4 bg-gradient-to-r from-red-950/40 via-amber-950/20 to-red-950/40 border border-red-500/40 rounded-2xl text-red-200 space-y-1.5">
        <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <span>⚠️ 1-OF-1 UNIQUE PIECE &middot; SINGLE PIECE AVAILABLE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Storefront rule: When you complete purchase for this item, it will be <strong>directly removed from our website store</strong> so no other shopper can purchase it.
        </p>
      </div>

      {/* Garment Colorway */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              Color / Shade: <span className="font-extrabold text-[#d4a853]">{selectedColor}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {product.colors.map((c) => {
              const isSelected = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onSelectColor(c.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#d4a853] bg-[#1a1d2b] text-white ring-1 ring-[#d4a853]'
                      : 'border-slate-800 bg-[#10121a] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Specification */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            Garment Size: <span className="font-extrabold text-[#d4a853]">{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>UK Sizing Guide</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {product.sizes.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onSelectSize(sz)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#d4a853] bg-[#d4a853] text-black shadow-md'
                    : 'border-slate-800 bg-[#13151f] text-white hover:border-slate-700'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shipping Carriers summary */}
      <div className="bg-[#10121a] border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <Truck className="w-4 h-4 text-[#d4a853]" />
          <span>UK Tracked Dispatch Options:</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
          <span className="bg-black/50 px-2 py-0.5 rounded border border-slate-800">Evri &middot; £2.60</span>
          <span className="bg-black/50 px-2 py-0.5 rounded border border-slate-800">InPost 24/7 &middot; £2.89</span>
          <span className="bg-black/50 px-2 py-0.5 rounded border border-slate-800">Royal Mail 48 &middot; £3.65</span>
          <span className="text-[#d4a853] font-bold">FREE on orders over £45</span>
        </div>
      </div>

      {/* CTA Buttons: Add to Bag, Card, PayPal UK, and WhatsApp */}
      <div className="flex flex-col gap-2.5 pt-2">
        {/* Primary Add to Cart Button */}
        <button
          id="product-add-to-bag-btn"
          type="button"
          onClick={onAddToCart}
          className="w-full py-4 px-6 rounded-2xl bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>ADD TO SHOPPING BAG</span>
          <span>&bull;</span>
          <span>{currencySymbol}{product.price.toFixed(2)}</span>
        </button>

        {/* Dual Instant Checkout Buttons: Card & PayPal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Instant Buy with Debit/Credit Card */}
          <button
            id="product-card-buy-btn"
            type="button"
            onClick={onBuyWithCard || onBuyWithPayPal}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#181b28] hover:bg-[#202538] text-white font-bold text-xs sm:text-sm tracking-wide border border-[#d4a853]/60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <CreditCard className="w-4 h-4 text-[#d4a853]" />
            <span>Pay with Card</span>
          </button>

          {/* Instant Buy with PayPal UK Button */}
          <button
            id="product-paypal-buy-btn"
            type="button"
            onClick={onBuyWithPayPal}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#ffc439] hover:bg-[#ffb000] text-[#003087] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buy with</span>
            <span className="italic font-black text-[#003087]">Pay</span>
            <span className="italic font-black text-[#0079c1] -ml-1">Pal</span>
          </button>
        </div>

        {/* WhatsApp Direct Order Button */}
        <button
          id="product-whatsapp-order-btn"
          type="button"
          onClick={onOrderViaWhatsApp}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-black text-black" />
          <span>Order via WhatsApp (+44 7591 878215)</span>
        </button>
      </div>

      {/* Trust Badges Stack */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 bg-[#13151f] p-2.5 rounded-xl border border-slate-800">
          <Truck className="w-3.5 h-3.5 text-[#d4a853] shrink-0" />
          <span>UK 24h Dispatch</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#13151f] p-2.5 rounded-xl border border-slate-800">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>7-Day UK Returns</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#13151f] p-2.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Buyer Protection</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#13151f] p-2.5 rounded-xl border border-slate-800">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
          <span>Live Support</span>
        </div>
      </div>
    </div>
  );
};
