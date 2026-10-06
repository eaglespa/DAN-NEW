import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, AlertTriangle, CreditCard, Sparkles, Tag, Plus, Check, Lock, RotateCcw, MessageCircle } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckoutPayPal: (carrier?: string, discountCode?: string, discountPercent?: number) => void;
  onCheckoutCard?: (carrier?: string, discountCode?: string, discountPercent?: number) => void;
  onCheckoutWhatsApp?: (carrier?: string) => void;
  currencySymbol: string;
  allProducts?: Product[];
  onAddProductToCart?: (product: Product, size?: string) => void;
  initialCouponCode?: string;
  initialCouponPercent?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutPayPal,
  onCheckoutCard,
  onCheckoutWhatsApp,
  currencySymbol,
  allProducts = [],
  onAddProductToCart,
  initialCouponCode,
  initialCouponPercent
}) => {
  if (!isOpen) return null;

  const [selectedCarrier, setSelectedCarrier] = useState<'evri' | 'inpost' | 'royalmail'>('evri');
  const [couponCode, setCouponCode] = useState(initialCouponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(
    initialCouponCode && initialCouponPercent ? { code: initialCouponCode, percent: initialCouponPercent } : null
  );
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(
    initialCouponCode ? `Voucher ${initialCouponCode} active (${initialCouponPercent}% OFF)` : ''
  );

  const carrierRates = {
    evri: { name: 'Evri Standard Delivery', cost: 2.60, time: '2-3 Days' },
    inpost: { name: 'InPost Locker / Shop', cost: 2.89, time: '2-3 Days' },
    royalmail: { name: 'Royal Mail 48 Tracked', cost: 3.65, time: '1-2 Days' }
  };

  const rawSubtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const discountAmount = appliedCoupon ? (rawSubtotal * appliedCoupon.percent) / 100 : 0;
  const subtotal = rawSubtotal - discountAmount;

  const freeShippingThreshold = 45.0;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const activeCarrierCost = subtotal >= freeShippingThreshold ? 0 : carrierRates[selectedCarrier].cost;
  const grandTotal = subtotal + activeCarrierCost;
  const installmentCost = (grandTotal / 3).toFixed(2);

  // Recommendations: Find available pieces not in the cart
  const cartIds = new Set(items.map(it => it.product.id));
  const upsellRecommendations = React.useMemo(() => {
    return allProducts
      .filter(p => !cartIds.has(p.id) && p.status !== 'sold' && p.stock > 0)
      .slice(0, 3);
  }, [allProducts, cartIds]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'STYLE10' || clean === 'WELCOME10') {
      setAppliedCoupon({ code: clean, percent: 10 });
      setCouponSuccess(`✓ ${clean} Applied! 10% Off your order.`);
      setCouponError('');
    } else if (clean === 'BUNDLE15' || clean === 'LOOK15') {
      setAppliedCoupon({ code: clean, percent: 15 });
      setCouponSuccess(`✓ ${clean} Applied! 15% Off complete look bundle.`);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try STYLE10 for 10% off.');
      setCouponSuccess('');
    }
  };

  const handleWhatsAppHold = () => {
    const list = items.map(it => `• ${it.product.title} (${it.selectedSize || '1-of-1'}) - £${it.product.price.toFixed(2)}`).join('\n');
    const msg = encodeURIComponent(
      `👑 *STYLE & CLASS LONDON - SHOPPING BAG HOLD*\n\n` +
      `Hello! I would like to reserve my shopping bag before it sells out:\n\n` +
      `${list}\n\n` +
      `💰 *Subtotal:* £${grandTotal.toFixed(2)} (${carrierRates[selectedCarrier].name})\n` +
      (appliedCoupon ? `🎁 *Voucher Code:* ${appliedCoupon.code} (${appliedCoupon.percent}% OFF)\n` : '') +
      `\nPlease assist me with dispatch!`
    );
    window.open(`https://wa.me/447591878215?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#13151f] text-white shadow-2xl flex flex-col border-l border-[#d4a853]/30">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0a0f]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4a853]" />
              <h2 className="text-base font-black text-white tracking-tight font-serif">
                Your Shopping Bag
              </h2>
              <span className="text-xs bg-[#d4a853] text-black font-extrabold px-2 py-0.5 rounded-full">
                {items.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-3.5 bg-[#090a0f] border-b border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Truck className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>
                  {amountToFreeShipping === 0
                    ? '🎉 You unlocked FREE Tracked UK Delivery!'
                    : `Add ${currencySymbol}${amountToFreeShipping.toFixed(2)} more for FREE UK Delivery`}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#e8c97a] font-bold">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4a853] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 1-of-1 Reminder banner */}
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Items are unique 1-of-1 pieces. They are archived from store immediately upon sale.</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Your bag is currently empty</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Discover our curated 1-of-1 vintage dresses, designer blouses, and luxury bags.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-[#d4a853] hover:bg-[#e8c97a] text-black rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((it, idx) => (
                <div
                  key={`${it.product.id}-${it.selectedColor}-${it.selectedSize}-${idx}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#0e1017] border border-slate-800 hover:border-[#d4a853]/40 transition-colors"
                >
                  <img
                    src={it.product.images[0]}
                    alt={it.product.title}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-700 bg-black shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] text-[#d4a853] font-bold uppercase">
                            {it.product.code && <span>[{it.product.code}]</span>}
                            <span>{it.product.brand}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {it.product.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="text-slate-400 hover:text-red-400 p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Size: <span className="font-semibold text-slate-200">{it.selectedSize}</span> &middot; <span className="text-emerald-400 font-bold">{it.product.condition}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        1-of-1 Piece
                      </span>

                      <span className="text-sm font-black text-[#d4a853]">
                        {currencySymbol}{(it.product.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* In-Drawer Upsell & Cross-Sell Recommendations (Audit Fix: Issue #3) */}
            {items.length > 0 && upsellRecommendations.length > 0 && onAddProductToCart && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
                    Complete the Look &middot; Recommended
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Bundle &amp; Save
                  </span>
                </div>

                <div className="space-y-2">
                  {upsellRecommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="p-2.5 bg-[#0a0c14] border border-slate-800 hover:border-[#d4a853]/50 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={rec.images[0]}
                          alt={rec.title}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#d4a853] font-bold uppercase truncate block">
                            {rec.brand}
                          </span>
                          <h5 className="text-[11px] font-bold text-white truncate" title={rec.title}>
                            {rec.title}
                          </h5>
                          <span className="text-xs font-black text-white font-mono">
                            {currencySymbol}{rec.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddProductToCart(rec, rec.sizes[0])}
                        className="px-3 py-1.5 bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold text-[11px] rounded-lg shadow-sm flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer / Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0a0a0f] space-y-3">
              {/* Voucher Code Form (Audit Fix: Issue #2) */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. STYLE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-[#13151f] border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-[#d4a853]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#1e2233] hover:bg-[#282d44] text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-colors shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && (
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-[10px] text-rose-400 font-bold">{couponError}</p>
                )}
              </form>

              {/* Carrier Selection */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">Select UK Delivery Courier:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['evri', 'inpost', 'royalmail'] as const).map(carrier => {
                    const c = carrierRates[carrier];
                    const isSelected = selectedCarrier === carrier;
                    return (
                      <button
                        key={carrier}
                        type="button"
                        onClick={() => setSelectedCarrier(carrier)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#d4a853] bg-[#181a24] text-white shadow-sm'
                            : 'border-slate-800 bg-[#0e1017] text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold block truncate capitalize">{carrier === 'royalmail' ? 'Royal Mail' : carrier}</span>
                        <span className="text-[11px] font-mono font-bold text-[#d4a853]">
                          {subtotal >= freeShippingThreshold ? 'FREE' : `£${c.cost.toFixed(2)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <div className="flex items-center justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-white font-mono">{currencySymbol}{rawSubtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Voucher ({appliedCoupon.code} - {appliedCoupon.percent}%)</span>
                    <span className="font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>{carrierRates[selectedCarrier].name}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {activeCarrierCost === 0 ? 'FREE' : `${currencySymbol}${activeCarrierCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-base text-[#d4a853] font-mono">
                    {currencySymbol}{grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* BNPL Installment pill */}
                <div className="text-[10px] text-slate-400 text-center pt-0.5">
                  Or 3 interest-free payments of <strong className="text-white">{currencySymbol}{installmentCost}</strong> with Klarna or PayPal
                </div>
              </div>

              {/* Payment Methods Buttons */}
              <div className="space-y-2 pt-1">
                {/* Debit or Credit Card Direct Button */}
                <button
                  id="cart-checkout-card-btn"
                  type="button"
                  onClick={() => onCheckoutCard 
                    ? onCheckoutCard(selectedCarrier, appliedCoupon?.code, appliedCoupon?.percent) 
                    : onCheckoutPayPal(selectedCarrier, appliedCoupon?.code, appliedCoupon?.percent)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c5953b] hover:from-[#e0b764] hover:to-[#d4a853] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#d4a853]/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99"
                >
                  <CreditCard className="w-4 h-4 text-black" />
                  <span>Pay with Bank Card (Visa / MC / Amex)</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-black" />
                </button>

                {/* PayPal UK Checkout Button */}
                <button
                  id="cart-checkout-paypal-btn"
                  type="button"
                  onClick={() => onCheckoutPayPal(selectedCarrier, appliedCoupon?.code, appliedCoupon?.percent)}
                  className="w-full py-3 px-4 rounded-xl bg-[#ffc439] hover:bg-[#ffb000] text-[#003087] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99"
                >
                  <span>Pay with</span>
                  <span className="italic font-black text-[#003087]">Pay</span>
                  <span className="italic font-black text-[#0079c1] -ml-1">Pal</span>
                  <span className="text-[10px] bg-white text-slate-900 font-extrabold px-1.5 py-0.5 rounded">UK</span>
                  <span className="text-[11px] font-sans text-slate-800 ml-1">/ Pay in 3</span>
                </button>

                {/* WhatsApp Cart Reservation Hold */}
                <button
                  type="button"
                  onClick={handleWhatsAppHold}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
                  <span>Hold &amp; Confirm via WhatsApp (+44 7591 878215)</span>
                </button>
              </div>

              {/* Trust & Guarantee Strip */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-[#d4a853]" />
                    <span>14-Day Guarantee</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400">
                  <span>Apple Pay</span> &middot;
                  <span>Google Pay</span> &middot;
                  <span>Visa</span> &middot;
                  <span>Mastercard</span> &middot;
                  <span>AMEX</span> &middot;
                  <span>Klarna</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
