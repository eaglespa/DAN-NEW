import React, { useState } from 'react';
import { X, Gift, Sparkles, MessageCircle, Mail, Check, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { CartItem } from '../types';

interface AbandonedCartRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  currencySymbol?: string;
  onApplyCoupon: (code: string, percent: number) => void;
  onProceedToCheckout: () => void;
}

export const AbandonedCartRecoveryModal: React.FC<AbandonedCartRecoveryModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  currencySymbol = '£',
  onApplyCoupon,
  onProceedToCheckout
}) => {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  if (!isOpen || items.length === 0) return null;

  const discountCode = 'STYLE10';
  const discountPercent = 10;
  const discountedSubtotal = subtotal * 0.9;
  const savings = subtotal * 0.1;

  const handleApplyDiscountAndCheckout = () => {
    onApplyCoupon(discountCode, discountPercent);
    setCouponApplied(true);

    // Save cart state to backend
    fetch('/api/abandoned-cart/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        items: items.map(it => ({
          productId: it.product.id,
          productTitle: it.product.title,
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.images[0] || '',
          color: it.selectedColor,
          size: it.selectedSize
        })),
        subtotal
      })
    }).catch(() => {});

    setTimeout(() => {
      onClose();
      onProceedToCheckout();
    }, 400);
  };

  const handleSendEmailRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/abandoned-cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          items: items.map(it => ({
            productId: it.product.id,
            productTitle: it.product.title,
            price: it.product.price,
            quantity: it.quantity,
            image: it.product.images[0] || '',
            color: it.selectedColor,
            size: it.selectedSize
          })),
          subtotal
        })
      });

      await fetch('/api/abandoned-cart/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          channel: 'email'
        })
      });

      setEmailSubmitted(true);
      onApplyCoupon(discountCode, discountPercent);
    } catch (err) {
      console.warn('Failed to dispatch recovery email:', err);
      setEmailSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRecovery = () => {
    const itemsList = items.map(it => `• ${it.product.title} (${it.selectedSize || '1-of-1'}) - £${it.product.price.toFixed(2)}`).join('\n');
    const text = encodeURIComponent(
      `👑 *STYLE & CLASS LONDON - CART RESERVATION*\n\n` +
      `Hello! I have reserved the following 1-of-1 piece(s) in my shopping bag:\n\n` +
      `${itemsList}\n\n` +
      `💰 *Subtotal:* £${subtotal.toFixed(2)}\n` +
      `🎁 *Voucher Code Applied:* STYLE10 (10% OFF)\n\n` +
      `Could you assist me with completing this order?`
    );

    window.open(`https://wa.me/447591878215?text=${text}`, '_blank');
    onApplyCoupon(discountCode, discountPercent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl border-2 border-[#d4a853] shadow-2xl overflow-hidden my-auto">
        {/* Banner Top Strip */}
        <div className="bg-gradient-to-r from-[#d4a853] via-[#f0ce7a] to-[#d4a853] py-2 px-4 text-black text-center font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
          <Gift className="w-4 h-4 fill-black text-[#d4a853]" />
          <span>Exclusive 10% Voucher &middot; Limited 1-of-1 Piece Hold</span>
        </div>

        {/* Modal Header */}
        <div className="p-5 bg-[#0a0c14] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#d4a853]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-serif">
                Wait! Don't Miss Your 1-of-1 Piece
              </h3>
              <p className="text-[11px] text-slate-400">
                Each garment is unique &middot; Another London shopper may buy it
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Cart preview strip */}
          <div className="p-3 bg-[#0a0c14] rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Items Currently in Your Bag ({items.reduce((a, b) => a + b.quantity, 0)}):
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-none">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.title}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                    <span className="text-white truncate font-medium text-[11px]">
                      {it.product.title}
                    </span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold shrink-0">
                    {currencySymbol}{it.product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
              <span className="text-slate-400 font-bold">Original: {currencySymbol}{subtotal.toFixed(2)}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-slate-400 text-[10px]">With 10% Discount:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {currencySymbol}{discountedSubtotal.toFixed(2)}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  Save {currencySymbol}{savings.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action: 1-Tap Claim 10% OFF & Checkout */}
          <button
            type="button"
            onClick={handleApplyDiscountAndCheckout}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c29642] hover:brightness-110 active:scale-98 text-black font-extrabold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4 text-black fill-black" />
            <span>Apply 10% Off (Code: STYLE10) &amp; Checkout Now</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          {/* Secondary Option: Email Sequence Capture */}
          {!emailSubmitted ? (
            <form onSubmit={handleSendEmailRecovery} className="p-3 bg-[#080910] rounded-2xl border border-slate-800 space-y-2">
              <label htmlFor="recovery-email-input" className="block text-[11px] font-bold text-slate-300">
                Or email me this 10% voucher to finish on another device:
              </label>
              <div className="flex gap-2">
                <input
                  id="recovery-email-input"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#12141f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1c1f2e] hover:bg-[#252a3f] text-white font-bold rounded-xl border border-slate-700 transition-colors text-xs shrink-0 cursor-pointer"
                >
                  {isSubmitting ? 'Sending...' : 'Email Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recovery email sent! Coupon code <strong>STYLE10</strong> has been applied to your session.</span>
            </div>
          )}

          {/* Tertiary Option: 1-Tap WhatsApp Cart Save */}
          <button
            type="button"
            onClick={handleWhatsAppRecovery}
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-[#25D366]" />
            <span>Save &amp; Hold Cart on Store WhatsApp (+44 7591 878215)</span>
          </button>

          {/* Trust strip */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center">
            <Clock className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Holds piece for 30 minutes &middot; Dispatched within 24H from London</span>
          </div>
        </div>
      </div>
    </div>
  );
};
