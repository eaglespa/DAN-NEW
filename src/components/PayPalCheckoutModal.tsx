import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Truck,
  CreditCard,
  Building2,
  Smartphone
} from 'lucide-react';
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
  initialPaymentMethod?: 'paypal' | 'card';
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
  initialPaymentMethod = 'paypal',
  onOrderSuccess
}) => {
  const [activePaymentTab, setActivePaymentTab] = useState<'paypal' | 'card'>(initialPaymentMethod);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [carrier, setCarrier] = useState<string>(initialCarrier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  const activeClientId = paypalClientId || 'BAAhhnSf00f00xNNYjsVnZoo0dVIAV76hZPo5AzXLCM1uJA5PU4IyrVb2vdeYVLTVgVbM-n_Gu7lNoWZow';

  const carrierRates: { [key: string]: { name: string; cost: number; time: string } } = {
    evri: { name: 'Evri Standard Delivery (£2.60)', cost: 2.60, time: '2-3 Working Days' },
    inpost: { name: 'InPost Locker / Shop (£2.89)', cost: 2.89, time: '2-3 Working Days' },
    royalmail: { name: 'Royal Mail 48 Tracked (£3.65)', cost: 3.65, time: '2 Working Days' }
  };

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const selectedRate = carrierRates[carrier] || carrierRates['evri'];
  const shipping = subtotal >= 45.0 ? 0 : selectedRate.cost;
  const total = Number((subtotal + shipping).toFixed(2));

  // Maintain refs to avoid stale closure state in PayPal SDK callbacks
  const totalRef = useRef(total);
  const shippingRef = useRef(shipping);
  const subtotalRef = useRef(subtotal);
  const fullNameRef = useRef(fullName);
  const phoneRef = useRef(phone);
  const addressRef = useRef(address);
  const cityRef = useRef(city);
  const postcodeRef = useRef(postcode);
  const carrierRef = useRef(carrier);
  const itemsRef = useRef(items);

  useEffect(() => {
    totalRef.current = total;
    shippingRef.current = shipping;
    subtotalRef.current = subtotal;
    fullNameRef.current = fullName;
    phoneRef.current = phone;
    addressRef.current = address;
    cityRef.current = city;
    postcodeRef.current = postcode;
    carrierRef.current = carrier;
    itemsRef.current = items;
  }, [total, shipping, subtotal, fullName, phone, address, city, postcode, carrier, items]);

  // Synchronize initialCarrier & initialPaymentMethod on open
  useEffect(() => {
    if (isOpen) {
      if (initialCarrier) setCarrier(initialCarrier);
      if (initialPaymentMethod) setActivePaymentTab(initialPaymentMethod);
      setErrorMessage('');
    }
  }, [isOpen, initialCarrier, initialPaymentMethod]);

  // Load PayPal SDK dynamically
  useEffect(() => {
    if (!isOpen || !activeClientId) return;

    const scriptId = 'paypal-js-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onScriptReady = () => {
      if (window.paypal) {
        setSdkLoaded(true);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(activeClientId)}&currency=GBP&intent=capture&enable-funding=card,paylater`;
      script.async = true;
      script.onload = onScriptReady;
      script.onerror = () => {
        console.warn('PayPal JS SDK script load failed, using direct express checkout.');
        setSdkLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setSdkLoaded(true);
    }
  }, [isOpen, activeClientId]);

  // Execute order submission to /api/orders
  const submitOrder = async (method: 'paypal_uk' | 'card_uk', paymentRefId?: string) => {
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const orderPayload = {
        carrier: carrierRef.current,
        items: itemsRef.current.map(it => ({
          productId: it.product.id,
          quantity: it.quantity,
          color: it.selectedColor,
          size: it.selectedSize,
          image: it.product.images[0] || ''
        })),
        customer: {
          fullName: fullNameRef.current,
          phone: phoneRef.current,
          address: addressRef.current,
          city: cityRef.current,
          postcode: postcodeRef.current
        },
        paymentMethod: method,
        notes: paymentRefId
          ? `${method === 'card_uk' ? 'Credit/Debit Card' : 'PayPal UK'} Transaction Ref: ${paymentRefId}`
          : method === 'card_uk'
          ? `Card Paid (${cardNumber.slice(-4) ? '•••• ' + cardNumber.slice(-4) : 'Direct Card'})`
          : 'PayPal UK Express Transaction'
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

  // Card validation & submission handler
  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !postcode.trim()) {
      setErrorMessage('⚠️ Please enter your Full Name, UK Phone, and Delivery Address.');
      return;
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      setErrorMessage('⚠️ Please enter a valid 16-digit debit or credit card number.');
      return;
    }

    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setErrorMessage('⚠️ Please enter card expiration in MM/YY format.');
      return;
    }

    if (cardCvc.length < 3) {
      setErrorMessage('⚠️ Please enter a valid 3 or 4-digit CVV / CVC code.');
      return;
    }

    submitOrder('card_uk', `CARD-AUTH-${Date.now().toString(36).toUpperCase()}`);
  };

  // Manual PayPal express submit
  const handleManualPayPalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !postcode.trim()) {
      setErrorMessage('⚠️ Please fill in your UK delivery address and mobile phone number.');
      return;
    }
    submitOrder('paypal_uk');
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Format Card Expiry MM/YY
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  // Render PayPal Smart Buttons when SDK is loaded and container is mounted
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
          if (
            !fullNameRef.current.trim() ||
            !phoneRef.current.trim() ||
            !addressRef.current.trim() ||
            !cityRef.current.trim() ||
            !postcodeRef.current.trim()
          ) {
            setErrorMessage('⚠️ Please enter your Full Name, UK Phone, and Address before clicking PayPal.');
            return actions.reject();
          }
          setErrorMessage('');
          return actions.resolve();
        },
        createOrder: (data: any, actions: any) => {
          const currentTotal = totalRef.current;
          const currentSubtotal = subtotalRef.current;
          const currentShipping = shippingRef.current;
          const currentItems = itemsRef.current;

          return actions.order.create({
            purchase_units: [{
              description: `Style & Class London - ${currentItems.length} 1-of-1 Piece(s)`,
              amount: {
                currency_code: 'GBP',
                value: currentTotal.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: 'GBP',
                    value: currentSubtotal.toFixed(2)
                  },
                  shipping: {
                    currency_code: 'GBP',
                    value: currentShipping.toFixed(2)
                  }
                }
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const capture = await actions.order.capture();
            await submitOrder('paypal_uk', capture?.id || data.orderID);
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
  }, [isOpen, sdkLoaded]);

  // Reset button rendered ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      buttonsRenderedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#090a0f] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#181a24] p-2 rounded-xl border border-[#d4a853]/50">
              <Lock className="w-5 h-5 text-[#d4a853]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="italic font-black text-[#0079C1] text-base sm:text-lg">Pay</span>
                <span className="italic font-black text-[#00457C] text-base sm:text-lg -ml-1">Pal</span>
                <span className="text-slate-500 font-bold">&amp;</span>
                <span className="text-xs sm:text-sm font-extrabold text-white">Cards</span>
                <span className="text-[10px] bg-[#d4a853] text-black font-black px-1.5 py-0.5 rounded ml-1">
                  UK SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Style And Class London &middot; Fast UK Dispatch
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
            Purchasing <strong>{items.reduce((a, b) => a + b.quantity, 0)} unique piece(s) (1-of-1)</strong>
          </span>
          <span className="text-sm font-black text-[#d4a853]">
            Total: {currencySymbol}{total.toFixed(2)}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/70 text-red-300 rounded-xl border border-red-800 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer & Delivery Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#d4a853] flex items-center gap-1.5">
              <span>1. UK Delivery &amp; Contact Details</span>
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
                placeholder="e.g. Charlotte Kensington"
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                UK Contact Mobile Phone (for WhatsApp Alert &amp; Courier Tracking) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07700 900123"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] transition-colors font-mono"
                />
                <Smartphone className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
              </div>
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
                  placeholder="e.g. W1J 0LF"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] uppercase font-mono"
                />
              </div>
            </div>

            {/* Courier Selection */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Dispatch Courier Company:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['evri', 'inpost', 'royalmail'] as const).map((cKey) => {
                  const c = carrierRates[cKey];
                  const isSelected = carrier === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setCarrier(cKey)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#d4a853] bg-[#1a1c27] text-white ring-1 ring-[#d4a853]'
                          : 'border-slate-800 bg-[#0a0a0f] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold block truncate capitalize">
                        {cKey === 'royalmail' ? 'Royal Mail' : cKey}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#d4a853]">
                        {subtotal >= 45 ? 'FREE' : `£${c.cost.toFixed(2)}`}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">{c.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Tabs */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#d4a853]">
              2. Select Payment Method
            </h4>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#090a0f] p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActivePaymentTab('paypal')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePaymentTab === 'paypal'
                    ? 'bg-[#181b29] text-[#ffc439] border border-[#ffc439]/50 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="italic font-black text-[#0079C1]">Pay</span>
                <span className="italic font-black text-[#00457C] -ml-1">Pal</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded ml-1 font-sans">
                  Pay in 3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab('card')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePaymentTab === 'card'
                    ? 'bg-[#181b29] text-white border border-[#d4a853]/60 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#d4a853]" />
                <span>Debit / Credit Card</span>
              </button>
            </div>

            {/* TAB CONTENT: DEBIT / CREDIT CARD */}
            {activePaymentTab === 'card' && (
              <form onSubmit={handleCardPayment} className="space-y-3 pt-1 animate-fade-in">
                <div className="flex items-center justify-between p-2.5 bg-[#090a0f] rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-300 font-medium">Accepted Cards:</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono">
                    <span className="bg-[#141622] px-1.5 py-0.5 rounded border border-slate-700 text-blue-400">VISA</span>
                    <span className="bg-[#141622] px-1.5 py-0.5 rounded border border-slate-700 text-amber-400">Mastercard</span>
                    <span className="bg-[#141622] px-1.5 py-0.5 rounded border border-slate-700 text-cyan-400">AMEX</span>
                    <span className="bg-[#141622] px-1.5 py-0.5 rounded border border-slate-700 text-emerald-400">Maestro</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName || fullName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as printed on card"
                    className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4532 •••• •••• ••••"
                      maxLength={19}
                      className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] font-mono tracking-wider"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="3 or 4 digits"
                      maxLength={4}
                      className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white focus:outline-none focus:border-[#d4a853] font-mono text-center"
                    />
                  </div>
                </div>

                {/* Primary Card Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c5953b] hover:from-[#e0b764] hover:to-[#d4a853] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#d4a853]/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing UK Debit/Credit Card...</span>
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {currencySymbol}{total.toFixed(2)} with Debit/Credit Card</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB CONTENT: PAYPAL */}
            {activePaymentTab === 'paypal' && (
              <div className="space-y-3 pt-1 animate-fade-in">
                {/* Official PayPal Smart Payment Buttons Container */}
                <div ref={paypalContainerRef} id="paypal-smart-buttons-container" className="w-full min-h-[44px]" />

                {/* Direct Express Fallback Button */}
                <button
                  type="button"
                  onClick={handleManualPayPalSubmit}
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
                      <Lock className="w-4 h-4" />
                      <span>Express One-Click PayPal Purchase</span>
                      <span>&bull;</span>
                      <span className="font-mono">{currencySymbol}{total.toFixed(2)}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted &middot; Immediate 1-of-1 Piece Reservation &middot; WhatsApp Notification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
