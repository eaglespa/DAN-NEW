import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Truck, 
  Ruler, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface FloatingWhatsAppButtonProps {
  settings: StoreSettings;
  currentProduct?: Product | null;
  activePage: 'home' | 'collections' | 'contact' | 'detail';
  hasStickyBar?: boolean;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  settings,
  currentProduct,
  activePage,
  hasStickyBar = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const rawPhone = settings.merchantWhatsApp || '+447591878215';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  // Subtle delayed tooltip to draw attention without being intrusive
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPrompted) {
        setShowTooltip(true);
      }
    }, 3500);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [hasPrompted]);

  const handleOpenChat = (presetMessage?: string) => {
    let finalMessage = presetMessage || customQuery.trim();

    if (!finalMessage) {
      if (activePage === 'detail' && currentProduct) {
        finalMessage = `👋 Hi Style & Class London! I have a question regarding:\n👗 *${currentProduct.title}* [${currentProduct.code || currentProduct.sku || '1-of-1'}]\nCould you please help me with sizing or UK delivery details?`;
      } else {
        finalMessage = `👋 Hi Style & Class London! I'm browsing the store and have a question about sizing and UK delivery. Could you assist me please?`;
      }
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
    window.open(waUrl, '_blank');
    setIsOpen(false);
    setShowTooltip(false);
    setHasPrompted(true);
  };

  const quickQuestions = [
    {
      id: 'sizing',
      icon: Ruler,
      label: 'Sizing & Fit Advice',
      query: activePage === 'detail' && currentProduct
        ? `👋 Hi! Could you give me exact measurements and fit advice for *${currentProduct.title}* (Size: ${currentProduct.sizes?.join(', ') || 'Standard'})?`
        : `👋 Hi Style & Class! I'd like help choosing the right size for an item. How do your UK vintage and designer sizes fit?`,
    },
    {
      id: 'delivery',
      icon: Truck,
      label: 'UK Delivery & Tracking',
      query: `🚚 Hi! Can you confirm UK delivery options (Evri £2.60, InPost £2.89, Royal Mail 48 Tracked £3.65) and estimated dispatch times?`,
    },
    {
      id: 'availability',
      icon: Sparkles,
      label: activePage === 'detail' && currentProduct ? 'Is this 1-of-1 available?' : '1-of-1 Authenticity & Condition',
      query: activePage === 'detail' && currentProduct
        ? `✨ Hi! Can you confirm if this 1-of-1 unique piece (*${currentProduct.title}*, £${currentProduct.price.toFixed(2)}) is still available to purchase?`
        : `✨ Hi Style & Class! How do you grade the quality and authenticity of your pre-loved designer pieces?`,
    },
  ];

  return (
    <div
      id="floating-whatsapp-container"
      className={`fixed z-40 right-4 sm:right-6 transition-all duration-300 ${
        hasStickyBar ? 'bottom-20 sm:bottom-22' : 'bottom-5 sm:bottom-6'
      }`}
    >
      {/* Interactive Quick-Enquiry Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 w-[calc(100vw-2rem)] sm:w-96 bg-[#13151f] text-white rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col backdrop-blur-md"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#181a24] via-[#12141c] to-[#0d0e15] p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-black flex items-center justify-center shadow-md">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#13151f] rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 font-serif">
                    <span>Style &amp; Class Concierge</span>
                  </h4>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Online &middot; Replies within minutes</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Context banner if viewing a specific product */}
              {activePage === 'detail' && currentProduct && (
                <div className="p-2.5 rounded-2xl bg-[#0a0a0f] border border-slate-800 flex items-center gap-3">
                  <img
                    src={currentProduct.images[0]}
                    alt={currentProduct.title}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-black shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#d4a853]">
                      Currently Viewing
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {currentProduct.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      £{currentProduct.price.toFixed(2)} &middot; {currentProduct.code || '1-of-1'}
                    </div>
                  </div>
                </div>
              )}

              {/* Greeting Note */}
              <div className="p-3 bg-[#0d0e15] rounded-2xl border border-slate-800/80 space-y-1 text-xs">
                <p className="text-slate-200 leading-relaxed font-medium">
                  Need help with <strong>sizing &amp; fit</strong>, <strong>UK delivery times</strong>, or <strong>item condition</strong>? Choose a quick question below or send us a custom message on WhatsApp!
                </p>
              </div>

              {/* Quick Inquiry Options */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Instant Questions
                </div>
                <div className="space-y-1.5">
                  {quickQuestions.map((q) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleOpenChat(q.query)}
                        className="w-full text-left p-2.5 rounded-xl bg-[#181a24] hover:bg-[#202330] border border-slate-800 hover:border-[#d4a853]/50 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded-lg bg-black/50 text-[#d4a853] flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-[#d4a853]/40">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                            {q.label}
                          </span>
                        </div>
                        <Send className="w-3.5 h-3.5 text-[#25D366] shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <label
                  htmlFor="whatsapp-custom-query"
                  className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1"
                >
                  Or Type Your Question:
                </label>
                <div className="relative">
                  <input
                    id="whatsapp-custom-query"
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customQuery.trim()) {
                        handleOpenChat();
                      }
                    }}
                    placeholder="e.g. Can you deliver by Friday to Manchester?"
                    className="w-full bg-[#0a0a0f] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenChat()}
                    disabled={!customQuery.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#25D366] text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#20ba5a] transition-all cursor-pointer"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer with One-Tap Direct WhatsApp Launch */}
            <div className="p-3 bg-[#0a0a0f] border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="text-[10px] text-slate-400 font-mono">
                {rawPhone}
              </div>
              <button
                type="button"
                onClick={() => handleOpenChat()}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-black rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button & Tooltip */}
      <div className="relative flex items-center justify-end">
        {/* Helper Tooltip Badge (visible automatically after few seconds or on hover) */}
        <AnimatePresence>
          {(showTooltip && !isOpen) && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
                setHasPrompted(true);
              }}
              className="absolute right-full mr-3 whitespace-nowrap bg-[#13151f]/95 text-white border border-[#25D366]/40 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-sm cursor-pointer hidden sm:flex items-center gap-2 group hover:border-[#25D366]"
            >
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-white group-hover:text-[#25D366] transition-colors">
                  Questions on Sizing or Delivery?
                </p>
                <p className="text-[10px] text-slate-400">
                  Instant WhatsApp reply &middot; London HQ
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  setHasPrompted(true);
                }}
                className="ml-1 text-slate-500 hover:text-slate-300 p-0.5"
                aria-label="Dismiss helper"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating WhatsApp Bubble */}
        <motion.button
          id="floating-whatsapp-action-btn"
          type="button"
          aria-label="Ask sizing or delivery questions on WhatsApp"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
            setHasPrompted(true);
          }}
          className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-2xl transition-colors cursor-pointer border-2 ${
            isOpen 
              ? 'bg-[#181a24] text-white border-slate-600' 
              : 'bg-[#25D366] hover:bg-[#22bf5b] text-black border-white/25 hover:border-white/50 shadow-[#25D366]/30'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 fill-black" />
              {/* Pulsing ring indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#13151f]" />
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
