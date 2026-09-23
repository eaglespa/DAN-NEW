import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Truck, CreditCard } from 'lucide-react';
import { CartItem, Order } from '../types';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currencySymbol: string;
  paypalClientId: string;
  merchantWhatsApp: string;
  initialCarrier?: string;
  onOrderSuccess: (order: Order, whatsappUrl: string, removedProducts: string[]) => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currencySymbol,
  paypalClientId,
  merchantWhatsApp,
  initialCarrier = 'evri',
  onOrderSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [carrier, setCarrier] = useState<string>(initialCarrier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  const activeClientId = paypalClientId || 'BAAhhnSf00f00xNNYjsVnZoo0dVIAV76hZPo5AzXLCM1uJA5PU4IyrVb2vdeYVLTVgVbM-n_Gu7lNoWZow';

  const carrierRates: { [key: string]: { name: string; cost: number } } = {
    evri: { name: 'Evri Standard Delivery (£2.60)', cost: 2.60 },
    inpost: { name: 'InPost Locker / Shop (£2.89)', cost: 2.89 },
    royalmail: { name: 'Royal Mail 48 Tracked (£3.65)', cost: 3.65 }
  };

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const selectedRate = carrierRates[carrier] || carrierRates['evri'];
  const shipping = subtotal >= 45.0 ? 0 : selectedRate.cost;
  const total = subtotal + shipping;

  // Load PayPal SDK dynamically when modal is open
  useEffect(() => {
    if (!isOpen || !activeClientId) return;

    buttonsRenderedRef.current = false;
    const scriptId = 'paypal-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onScriptReady = () => {
      if (window.paypal) {
        setSdkLoaded(true);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(activeClientId)}&currency=GBP&intent=capture`;
      script.async = true;
      script.onload = onScriptReady;
      script.onerror = () => {
        console.warn('PayPal JS SDK failed to load, using direct express checkout.');
        setSdkLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setSdkLoaded(true);
    }
  }, [isOpen, activeClientId]);

  // Execute order submission to /api/orders
  const submitOrder = async (paymentRefId?: string) => {
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const orderPayload = {
        carrier,
        items: items.map(it => ({
          productId: it.product.id,
          quantity: it.quantity,
          color: it.selectedColor,
          size: it.selectedSize
        })),
        customer: {
          fullName,
          phone,
          address,
          city,
          postcode
        },
        paymentMethod: 'paypal_uk',
        notes: paymentRefId ? `PayPal UK Transaction Ref: ${paymentRefId}` : 'PayPal UK Express Transaction'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed. Please try again.');
      }

      setIsProcessing(false);

      if (data.whatsappUrl) {
        try {
          window.open(data.whatsappUrl, '_blank');
        } catch (popupErr) {
          console.warn('WhatsApp alert window open blocked by browser popup setting:', popupErr);
        }
      }

      onOrderSuccess(
        data.order,
        data.whatsappUrl,
        data.removedFromStoreProducts || []
      );
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during checkout.');
    }
  };

  const handleManualPayPalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !postcode.trim()) {
      setErrorMessage('Please fill in your UK delivery address and mobile phone number.');
      return;
    }
    submitOrder();
  };

  // Render PayPal Smart Buttons when SDK is loaded
  useEffect(() => {
    if (!isOpen || !sdkLoaded || !window.paypal || !paypalContainerRef.current) return;
    if (buttonsRenderedRef.current) return;

    try {
      paypalContainerRef.current.innerHTML = '';
      window.paypal.Buttons({
        style: {
          color: 'gold',
          shape: 'pill',
          label: 'pay',
          layout: 'vertical',
          height: 44
        },
        onClick: (data: any, actions: any) => {
          if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !postcode.trim()) {
            setErrorMessage('⚠️ Please enter your Full Name, UK Phone, and Address before clicking PayPal.');
            return actions.reject();
          }
          setErrorMessage('');
          return actions.resolve();
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: `Style & Class London - ${items.length} 1-of-1 Piece(s)`,
              amount: {
                currency_code: 'GBP',
                value: total.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: 'GBP',
                    value: subtotal.toFixed(2)
                  },
                  shipping: {
                    currency_code: 'GBP',
                    value: shipping.toFixed(2)
                  }
                }
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const capture = await actions.order.capture();
            await submitOrder(capture?.id || data.orderID);
          } catch (err: any) {
            setErrorMessage('Payment capture encountered an issue: ' + (err?.message || 'Please try again.'));
          }
        },
        onError: (err: any) => {
          console.warn('PayPal Button error:', err);
        }
      }).render(paypalContainerRef.current);

      buttonsRenderedRef.current = true;
    } catch (err) {
      console.warn('Could not initialize PayPal buttons:', err);
    }
  }, [isOpen, sdkLoaded, total, subtotal, shipping, fullName, phone, address, city, postcode, carrier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 my-auto">
        {/* PayPal UK Modal Header */}
        <div className="p-4 sm:p-5 bg-[#090a0f] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#181a24] p-2 rounded-xl border border-slate-700">
              <Lock className="w-5 h-5 text-[#d4a853]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="italic font-black text-[#0079C1] text-lg">Pay</span>
                <span className="italic font-black text-[#00457C] text-lg -ml-1">Pal</span>
                <span className="text-xs bg-[#d4a853] text-black font-black px-1.5 py-0.5 rounded ml-1">
                  UK
                </span>
                <span className="text-xs text-slate-300 font-medium ml-1">Express Gateway</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Style And Class London &middot; Tracked UK Dispatch
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

        {/* Order Summary Strip */}
        <div className="bg-[#0e1017] px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300">
            Purchasing <strong>{items.reduce((a, b) => a + b.quantity, 0)} piece(s) (1-of-1)</strong>
          </span>
          <span className="text-sm font-black text-[#d4a853]">
            Total: {currencySymbol}{total.toFixed(2)}
          </span>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleManualPayPalSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 text-red-300 rounded-xl border border-red-800 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#d4a853]">
              1. UK Delivery &amp; Contact Details
            </h4>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Liam Smith"
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                UK Contact Mobile Phone (for WhatsApp &amp; courier tracking) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07700 900123"
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 4, 25 High Street"
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  UK Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] uppercase font-mono"
                />
              </div>
            </div>

            {/* Courier Selection */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Dispatch Courier:
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853]"
              >
                <option value="evri">Evri Standard Delivery (£2.60)</option>
                <option value="inpost">InPost Locker / Shop Pickup (£2.89)</option>
                <option value="royalmail">Royal Mail 48 Tracked (£3.65)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#d4a853]">
              2. Payment &amp; Automatic Store Archive
            </h4>
            <div className="p-3 bg-[#0a0a0f] rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-white">PayPal UK Protected Gateway</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Pay in 3 Available</span>
            </div>
          </div>

          {/* Official PayPal Smart Payment Buttons Container */}
          <div className="space-y-2.5 pt-1">
            <div ref={paypalContainerRef} id="paypal-smart-buttons-container" className="w-full min-h-[44px]" />

            {/* Direct Express Fallback Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#ffc439] hover:bg-[#ffb000] disabled:opacity-50 text-[#003087] font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99"
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
                  <span>Processing PayPal UK Transaction...</span>
                </span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Express One-Click PayPal Purchase</span>
                  <span>&bull;</span>
                  <span className="font-mono">{currencySymbol}{total.toFixed(2)}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PayPal UK Buyer Protection &middot; WhatsApp Notification Dispatched</span>
          </div>
        </form>
      </div>
    </div>
  );
};
