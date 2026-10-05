import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Smartphone,
  ExternalLink,
  MessageCircle,
  HelpCircle
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
  onInstantDelete?: (productIds: string[]) => void;
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
  initialPaymentMethod = 'card',
  onInstantDelete,
  onOrderSuccess
}) => {
  const [activePaymentTab, setActivePaymentTab] = useState<'card' | 'paypal'>(
    initialPaymentMethod === 'paypal' ? 'paypal' : 'card'
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [carrier, setCarrier] = useState<string>(initialCarrier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [effectiveClientId, setEffectiveClientId] = useState<string>(
    paypalClientId || 'BAAhhnSf00f00xNNYjsVnZoo0dVIAV76hZPo5AzXLCM1uJA5PU4IyrVb2vdeYVLTVgVbM-n_Gu7lNoWZow'
  );
  const [completedOrder, setCompletedOrder] = useState<{
    order: Order;
    directPayPalUrl: string;
    whatsappUrl: string;
    captureId?: string;
  } | null>(null);

  // References to DOM button containers
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Track button rendering states
  const cardRenderedRef = useRef(false);
  const paypalRenderedRef = useRef(false);

  const carrierRates: { [key: string]: { name: string; cost: number; time: string } } = {
    evri: { name: 'Evri Standard Tracked (£2.60)', cost: 2.60, time: '2–3 Working Days' },
    inpost: { name: 'InPost 24/7 Locker (£2.89)', cost: 2.89, time: '2–3 Working Days' },
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
      if (initialPaymentMethod) {
        setActivePaymentTab(initialPaymentMethod === 'paypal' ? 'paypal' : 'card');
      }
      setErrorMessage('');
      setProcessingStatus('');
      setCompletedOrder(null);
      cardRenderedRef.current = false;
      paypalRenderedRef.current = false;
    }
  }, [isOpen, initialCarrier, initialPaymentMethod]);

  // Fetch live PayPal configuration on mount
  useEffect(() => {
    fetch('/api/paypal/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg && cfg.clientId) {
          setEffectiveClientId(cfg.clientId);
        }
      })
      .catch(err => {
        console.warn('Could not fetch PayPal config, using default:', err);
      });
  }, []);

  // Dynamically load official PayPal JS SDK
  useEffect(() => {
    if (!isOpen || !effectiveClientId) return;

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
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        effectiveClientId
      )}&currency=GBP&intent=capture&enable-funding=card,paylater`;
      script.async = true;
      script.onload = onScriptReady;
      script.onerror = () => {
        console.warn('PayPal JS SDK failed to load');
        setSdkLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setSdkLoaded(true);
    }
  }, [isOpen, effectiveClientId]);

  // Validate Delivery details helper
  const validateDeliveryDetails = () => {
    if (!fullNameRef.current.trim()) {
      setErrorMessage('⚠️ Please enter your Full Name.');
      return false;
    }
    if (!phoneRef.current.trim()) {
      setErrorMessage('⚠️ Please enter your UK Mobile Phone number for courier updates.');
      return false;
    }
    if (!addressRef.current.trim()) {
      setErrorMessage('⚠️ Please enter your Street Address.');
      return false;
    }
    if (!cityRef.current.trim()) {
      setErrorMessage('⚠️ Please enter your City or Town.');
      return false;
    }
    if (!postcodeRef.current.trim()) {
      setErrorMessage('⚠️ Please enter your UK Postcode.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Common PayPal createOrder call to server
  const handleServerCreateOrder = async () => {
    setErrorMessage('');
    setIsProcessing(true);
    setProcessingStatus('Initiating secure transaction with PayPal UK...');

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsRef.current.map(it => ({ id: it.product.id, quantity: it.quantity })),
          shippingCarrierId: carrierRef.current,
          customer: {
            fullName: fullNameRef.current.trim(),
            phone: phoneRef.current.trim(),
            address: addressRef.current.trim(),
            city: cityRef.current.trim(),
            postcode: postcodeRef.current.trim()
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.orderId) {
        throw new Error(data.error || 'Failed to create PayPal checkout session');
      }

      setProcessingStatus('Awaiting authorization...');
      return data.orderId;
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStatus('');
      setErrorMessage(err.message || 'Error connecting to PayPal gateway');
      throw err;
    }
  };

  // Common PayPal onApprove / capture call to server
  const handleServerCaptureOrder = async (orderId: string, paymentMethod: 'card_uk' | 'paypal_uk') => {
    setIsProcessing(true);
    setProcessingStatus('Securing payment capture and settling funds...');

    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: orderId,
          customer: {
            fullName: fullNameRef.current.trim(),
            phone: phoneRef.current.trim(),
            address: addressRef.current.trim(),
            city: cityRef.current.trim(),
            postcode: postcodeRef.current.trim()
          },
          carrier: carrierRef.current,
          items: itemsRef.current,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || 'Payment capture failed. Funds were not transferred.');
      }

      // CRITICAL REQUIREMENT: Instant 1-of-1 piece inventory deletion
      const productIdsToDelete = itemsRef.current.map(it => it.product.id);
      try {
        const existing = JSON.parse(localStorage.getItem('styleandclass_sold_ids') || '[]');
        localStorage.setItem(
          'styleandclass_sold_ids',
          JSON.stringify(Array.from(new Set([...existing, ...productIdsToDelete])))
        );
      } catch (e) {}

      if (onInstantDelete) {
        onInstantDelete(productIdsToDelete);
      }

      const whatsappUrl = data.whatsappUrl || `https://api.whatsapp.com/send?phone=447591878215&text=${encodeURIComponent(data.whatsappReportText || '')}`;

      // Allow PayPal SDK's internal promise resolution to complete cleanly before unmounting/transitioning
      setTimeout(() => {
        setCompletedOrder({
          order: data.order,
          directPayPalUrl: `https://www.paypal.com/activity/payment/${data.captureId}`,
          whatsappUrl,
          captureId: data.captureId
        });

        onOrderSuccess(data.order, whatsappUrl, productIdsToDelete);
      }, 250);
    } catch (err: any) {
      setErrorMessage('⚠️ ' + (err.message || 'Payment capture error. Please contact Style & Class support.'));
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Render Card and PayPal Buttons when SDK is loaded and modal is open
  useEffect(() => {
    if (!isOpen || !sdkLoaded || !window.paypal) return;

    // Render Card Button into cardContainerRef
    if (cardContainerRef.current && !cardRenderedRef.current) {
      try {
        cardContainerRef.current.innerHTML = '';
        window.paypal
          .Buttons({
            fundingSource: window.paypal.FUNDING.CARD,
            style: {
              layout: 'vertical',
              color: 'black',
              shape: 'rect',
              label: 'pay',
              height: 48
            },
            onClick: (data: any, actions: any) => {
              if (!validateDeliveryDetails()) {
                return actions.reject();
              }
              return actions.resolve();
            },
            createOrder: () => handleServerCreateOrder(),
            onApprove: (data: any) => handleServerCaptureOrder(data.orderID, 'card_uk'),
            onCancel: () => {
              setIsProcessing(false);
              setProcessingStatus('');
            },
            onError: (err: any) => {
              console.error('PayPal Card Button Error:', err);
              setIsProcessing(false);
              setProcessingStatus('');
              setErrorMessage('Card payment cancelled or authorization failed.');
            }
          })
          .render(cardContainerRef.current)
          .then(() => {
            cardRenderedRef.current = true;
          })
          .catch((err: any) => {
            console.warn('Could not render dedicated card button, rendering standard buttons:', err);
            if (cardContainerRef.current) {
              cardContainerRef.current.innerHTML = '';
              window.paypal
                .Buttons({
                  style: { layout: 'vertical', color: 'black', shape: 'rect', height: 48 },
                  onClick: (data: any, actions: any) => {
                    if (!validateDeliveryDetails()) return actions.reject();
                    return actions.resolve();
                  },
                  createOrder: () => handleServerCreateOrder(),
                  onApprove: (data: any) => handleServerCaptureOrder(data.orderID, 'card_uk'),
                  onError: () => setIsProcessing(false)
                })
                .render(cardContainerRef.current);
              cardRenderedRef.current = true;
            }
          });
      } catch (err) {
        console.warn('Error setting up Card buttons:', err);
      }
    }

    // Render PayPal Button into paypalContainerRef
    if (paypalContainerRef.current && !paypalRenderedRef.current) {
      try {
        paypalContainerRef.current.innerHTML = '';
        window.paypal
          .Buttons({
            fundingSource: window.paypal.FUNDING.PAYPAL,
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 48
            },
            onClick: (data: any, actions: any) => {
              if (!validateDeliveryDetails()) {
                return actions.reject();
              }
              return actions.resolve();
            },
            createOrder: () => handleServerCreateOrder(),
            onApprove: (data: any) => handleServerCaptureOrder(data.orderID, 'paypal_uk'),
            onCancel: () => {
              setIsProcessing(false);
              setProcessingStatus('');
            },
            onError: (err: any) => {
              console.error('PayPal Button Error:', err);
              setIsProcessing(false);
              setProcessingStatus('');
              setErrorMessage('PayPal transaction was cancelled or encountered an error.');
            }
          })
          .render(paypalContainerRef.current)
          .then(() => {
            paypalRenderedRef.current = true;
          })
          .catch((err: any) => {
            console.warn('Error rendering PayPal button:', err);
          });
      } catch (err) {
        console.warn('Error setting up PayPal buttons:', err);
      }
    }
  }, [isOpen, sdkLoaded, activePaymentTab]);

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
                <span className="text-sm sm:text-base font-extrabold text-white">UK Secure Checkout</span>
                <span className="text-[10px] bg-[#d4a853] text-black font-black px-1.5 py-0.5 rounded ml-1">
                  PAYPAL &amp; CARDS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Style And Class London &middot; Tracked UK Shipping
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

        {/* SUCCESS RECEIPT VIEW */}
        {completedOrder && (
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Order #{completedOrder.order.id}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {completedOrder.order.paymentMethod === 'card_uk'
                  ? 'Debit/Credit Card Payment Approved!'
                  : completedOrder.order.paymentMethod === 'paypal_uk'
                  ? 'PayPal UK Payment Confirmed!'
                  : 'WhatsApp Reservation Placed!'}
              </h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                ✓ Funds Received by Style &amp; Class &middot; 1-of-1 Piece Removed from Website
              </p>
            </div>

            {/* Official Card / PayPal Payment Receipt Breakdown */}
            <div className="bg-[#0b0d14] rounded-2xl p-4 border border-emerald-500/30 text-left text-xs space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#d4a853]" />
                  Settlement Receipt
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  {completedOrder.order.paymentStatus === 'completed' ? 'PAID &amp; SETTLED' : 'RESERVED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Amount Charged</span>
                  <strong className="text-white font-mono text-sm font-black text-[#d4a853]">
                    £{completedOrder.order.total.toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Method</span>
                  <strong className="text-white font-mono capitalize">
                    {completedOrder.order.paymentMethod === 'card_uk'
                      ? 'Bank Card (via PayPal UK)'
                      : completedOrder.order.paymentMethod === 'paypal_uk'
                      ? 'PayPal UK Express'
                      : 'WhatsApp Direct'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Recipient</span>
                  <span className="text-slate-300 font-medium">
                    {completedOrder.order.customer.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Delivery Carrier</span>
                  <span className="text-slate-300 font-mono">
                    {completedOrder.order.carrierName}
                  </span>
                </div>
                {completedOrder.captureId && (
                  <div className="col-span-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500 block text-[10px]">PayPal Transaction Reference</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold">
                      {completedOrder.captureId}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Merchant: Style &amp; Class London</span>
                <span className="font-mono text-slate-500">styleandclasslondon@gmail.com</span>
              </div>
            </div>

            {/* Scannable Address Barcode for Courier Dispatch */}
            {completedOrder.order.addressBarcode && (
              <div className="p-3 bg-[#0b0d14] rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-inner">
                <span className="text-[10px] text-[#d4a853] font-bold block uppercase tracking-wider">
                  📦 Courier Shipping Address Barcode
                </span>
                <img
                  src={completedOrder.order.addressBarcode}
                  alt="Shipping Address Barcode"
                  className="w-24 h-24 mx-auto bg-white p-1 rounded-xl shadow-md"
                />
                <span className="text-[9px] text-slate-400 font-mono block">
                  Scannable Barcode for Logistics &middot; Alert Dispatched to WhatsApp
                </span>
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              {completedOrder.whatsappUrl && (
                <a
                  href={completedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Send WhatsApp Confirmation to Store</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
              >
                Close &amp; Return to Store
              </button>
            </div>
          </div>
        )}

        {/* CHECKOUT FORM VIEW */}
        <div className={completedOrder ? 'hidden' : 'p-5 sm:p-6 space-y-4 text-xs'}>
            {errorMessage && (
              <div className="p-3 bg-red-950/70 text-red-300 rounded-xl border border-red-800 flex items-center gap-2 font-medium animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: UK Delivery Details */}
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
                  className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none transition-colors ${
                    errorMessage && !fullName ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  UK Mobile Phone (for Tracked Delivery Updates) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900123"
                    className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none transition-colors font-mono ${
                      errorMessage && !phone ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
                    }`}
                  />
                  <Smartphone className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Street Address &amp; House/Flat Number *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 4, 25 High Street"
                  className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none ${
                    errorMessage && !address ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Town / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. London"
                    className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none ${
                      errorMessage && !city ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
                    }`}
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
                    className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none uppercase font-mono ${
                      errorMessage && !postcode ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
                    }`}
                  />
                </div>
              </div>

              {/* Courier Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Dispatch Courier:
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

            {/* Section 2: Real Payment Gateway Tabs */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#d4a853]">
                2. Select Real Payment Method
              </h4>

              {/* Payment Tabs (Card and PayPal only) */}
              <div className="grid grid-cols-2 gap-2 bg-[#090a0f] p-1 rounded-2xl border border-slate-800">
                {/* Credit / Debit Card Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab('card');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs ${
                    activePaymentTab === 'card'
                      ? 'bg-[#181b29] text-white border border-[#d4a853] shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#d4a853]" />
                  <span>Debit / Credit Card</span>
                </button>

                {/* PayPal Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab('paypal');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs ${
                    activePaymentTab === 'paypal'
                      ? 'bg-[#181b29] text-[#ffc439] border border-[#ffc439]/60 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="italic font-black text-[#0079C1]">Pay</span>
                  <span className="italic font-black text-[#00457C] -ml-1">Pal</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded ml-1 font-sans">
                    Pay in 3
                  </span>
                </button>
              </div>

              {/* TAB 1: DEBIT OR CREDIT CARD (REAL PAYPAL CARD GATEWAY) */}
              <div className={activePaymentTab === 'card' ? 'space-y-3 pt-1 animate-fade-in' : 'hidden'}>
                <div className="p-3 bg-[#0a0c14] rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Direct UK Card Settlement
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-mono font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700">VISA</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700">Mastercard</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700">AMEX</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Money is charged from your bank card and deposited straight into Style &amp; Class London&apos;s PayPal account. 
                    <strong> No PayPal login required.</strong>
                  </p>
                </div>

                {/* Processing Status Banner */}
                {isProcessing && activePaymentTab === 'card' && (
                  <div className="p-3 bg-[#161a29] border border-[#d4a853]/40 rounded-xl flex items-center gap-2.5 text-[#d4a853] text-xs font-bold animate-pulse">
                    <div className="w-4 h-4 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{processingStatus || 'Connecting with PayPal UK Card Processor...'}</span>
                  </div>
                )}

                {/* Official PayPal Card Button Container */}
                <div className="space-y-2">
                  {!sdkLoaded && (
                    <div className="p-4 bg-[#0a0a0f] border border-slate-800 rounded-2xl text-center text-slate-400 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
                      <span>Initializing secure UK card checkout...</span>
                    </div>
                  )}
                  <div ref={cardContainerRef} id="paypal-card-button-container" className="w-full min-h-[48px]" />
                </div>
              </div>

              {/* TAB 2: PAYPAL UK ACCOUNT / PAY IN 3 */}
              <div className={activePaymentTab === 'paypal' ? 'space-y-3 pt-1 animate-fade-in' : 'hidden'}>
                <div className="p-3 bg-[#0a0c14] rounded-2xl border border-slate-800 space-y-1 text-slate-300">
                  <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ffc439]" />
                    PayPal Express &middot; Pay with Balance, Bank, or Pay in 3
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Log in to your PayPal account to complete checkout instantly.
                  </p>
                </div>

                {/* Processing Status Banner */}
                {isProcessing && activePaymentTab === 'paypal' && (
                  <div className="p-3 bg-[#161a29] border border-[#ffc439]/40 rounded-xl flex items-center gap-2.5 text-[#ffc439] text-xs font-bold animate-pulse">
                    <div className="w-4 h-4 border-2 border-[#ffc439] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{processingStatus || 'Processing PayPal UK Payment...'}</span>
                  </div>
                )}

                {!sdkLoaded && (
                  <div className="p-4 bg-[#0a0a0f] border border-slate-800 rounded-2xl text-center text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#ffc439] border-t-transparent rounded-full animate-spin" />
                    <span>Connecting with PayPal...</span>
                  </div>
                )}
                <div ref={paypalContainerRef} id="paypal-smart-buttons-container" className="w-full min-h-[48px]" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real Live UK Bank Settlements &middot; Instant 1-of-1 Stock Removal</span>
            </div>
          </div>
        </div>
      </div>
  );
};
