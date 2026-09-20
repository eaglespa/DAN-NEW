import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, MessageCircle, ChevronLeft, ChevronRight, Truck, Tag, ExternalLink } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string) => void;
  onBuyNowWithPayPal: (product: Product, size?: string) => void;
  settings: StoreSettings;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNowWithPayPal,
  settings
}) => {
  if (!isOpen || !product) return null;

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const images = product.images || [];
  const currentImg = images[activeImgIndex] || images[0] || '';

  const cleanPhone = settings.merchantWhatsApp.replace(/[^0-9+]/g, '').replace('+', '');
  const waDirectMessage = `Hi Style & Class London! I am interested in purchasing:
👗 *${product.title}* [${product.code || '1-of-1'}]
Brand: ${product.brand || 'Designer'}
Price: £${product.price.toFixed(2)}
Size: ${product.sizes?.[0] || 'Standard'}
Is this piece still available for UK delivery?`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waDirectMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#13151f] border border-[#d4a853]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          id="close-quick-view-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Images Gallery */}
        <div className="md:w-1/2 bg-[#090a0f] p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          {/* Main Photo View */}
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
            <img
              src={currentImg}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.code && (
                <span className="bg-black/90 text-[#f5c469] border border-[#d4a853]/50 text-xs font-mono font-bold px-2.5 py-0.5 rounded shadow">
                  {product.code}
                </span>
              )}
              <span className="bg-red-500 text-white text-[10.5px] font-black px-2 py-0.5 rounded shadow uppercase">
                1 OF 1 &middot; PRE-LOVED
              </span>
            </div>

            {/* Photo Navigation */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((activeImgIndex - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((activeImgIndex + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-12 h-16 rounded-md overflow-hidden shrink-0 border transition-all ${
                    activeImgIndex === idx ? 'border-[#d4a853] ring-1 ring-[#d4a853]' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Garment Details & Buy Box */}
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-5 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#d4a853] uppercase tracking-wider mb-1">
              <span>{product.brand || 'Designer'}</span>
              <span>&middot;</span>
              <span>{product.category}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{product.title}</h2>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#d4a853]">
              £{product.price.toFixed(2)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">
                £{product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              UK Stock &middot; Ready to Dispatch
            </span>
          </div>

          {/* Condition & Size Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#0a0a0f] p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Condition Grade</span>
              <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-[#d4a853]" />
                {product.condition || 'Inspected Pre-Loved'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Size Specification</span>
              <span className="font-bold text-white block mt-0.5">
                {product.sizes?.join(', ') || 'Standard'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* 1-of-1 Rule Alert */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300">1-of-1 Inventory Guarantee:</strong>
              This is a unique curated vintage piece. When you complete checkout, this item is immediately and permanently removed from our store catalog so no one else can purchase it.
            </div>
          </div>

          {/* Carriers Notice */}
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Truck className="w-4 h-4 text-[#d4a853]" />
            <span>Fast UK Delivery via <strong>Evri (£2.60)</strong>, <strong>InPost (£2.89)</strong>, or <strong>Royal Mail (£3.65)</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="quick-view-add-bag-btn"
              type="button"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag &middot; £{product.price.toFixed(2)}</span>
            </button>

            <button
              id="quick-view-paypal-btn"
              type="button"
              onClick={() => {
                onBuyNowWithPayPal(product);
                onClose();
              }}
              className="w-full bg-[#ffc439] hover:bg-[#ffb000] text-[#003087] font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Buy with PayPal (UK)</span>
            </button>

            <a
              id="quick-view-whatsapp-btn"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order via WhatsApp (+44 7591 878215)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
