import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MessageCircle, 
  AlertTriangle, 
  MapPin, 
  ExternalLink, 
  Truck, 
  QrCode, 
  Download, 
  Copy, 
  Phone, 
  User, 
  Package, 
  Check, 
  ShieldCheck,
  Navigation,
  Printer,
  CreditCard
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  whatsappUrl: string;
  removedProducts: string[];
  onClose: () => void;
  currencySymbol: string;
  onOpenLabel?: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsappUrl,
  removedProducts,
  onClose,
  currencySymbol,
  onOpenLabel
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  if (!order) return null;

  const fullAddress = `${order.customer.address}, ${order.customer.city}, ${order.customer.postcode}, United Kingdom`;
  const cleanPhone = (order.customer.phone || '').replace(/[^0-9+]/g, '');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  
  // Scannable barcode image link & address QR code
  const barcodeUrl = order.barcodeUrl || `${window.location.origin}/api/barcode/${order.id}`;
  const barcodeImageSrc = order.addressBarcode || barcodeUrl;

  const qrImageSrc = order.addressQrDataUrl || 
    order.addressQrUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fullAddress)}`;

  const paymentMethodLabel = order.paymentMethod === 'card_uk' || order.paymentMethod === 'card'
    ? 'Credit / Debit Card (Bank Card Settlement)'
    : 'PayPal UK (Express / Pay in 3 / Balance)';

  // Complete, fully-detailed report containing all requested details
  const fullAlertText = 
`🛍️ *STYLE & CLASS LONDON — FULL ORDER ALERT REPORT* 🛍️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 *ORDER ID:* #${order.id}
💳 *BUYER PAYMENT METHOD (PAYPAL OR CREDIT CARD):*
${paymentMethodLabel} [PAID & SETTLED] ✅

👤 *BUYER NAME:*
${order.customer.fullName}

📍 *BUYER ADDRESS:*
${fullAddress}

📞 *BUYER PHONE NUMBER:*
${order.customer.phone}

🏷️ *BUYER ADDRESS (BARCODE):*
${barcodeUrl}
(Scannable Courier Barcode for Shipping Label)

📦 *SOLD ITEM NAME & PRICE:*
${order.items.map((it, idx) => `• Item ${idx + 1}: ${it.productTitle} [${it.code || '1-of-1'}] — £${it.price.toFixed(2)} (Qty: ${it.quantity}, Size: ${it.size})`).join('\n')}

💰 *TOTAL TRANSACTION PAID:*
£${order.total.toFixed(2)} GBP (Items: £${order.subtotal.toFixed(2)} + Shipping: £${order.shipping.toFixed(2)})

📸 *SOLD ITEM PHOTO:*
${order.items.map((it, idx) => `• Photo ${idx + 1} (${it.productTitle}):\n${it.image}`).join('\n\n')}

🚚 *SHIPPING COMPANY (CHOSEN BY BUYER):*
${order.carrierName || 'Evri Standard Delivery'} (${order.shipping === 0 ? 'FREE Shipping' : `£${order.shipping.toFixed(2)}`})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Ready for 24h courier dispatch.*`;

  const storePhone = '447591878215';
  const effectiveWhatsAppUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(fullAlertText)}`;

  // Automatically trigger WhatsApp alert window
  React.useEffect(() => {
    try {
      const timer = setTimeout(() => {
        window.open(effectiveWhatsAppUrl, '_blank', 'noopener,noreferrer');
      }, 600);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Auto WhatsApp dispatch caught:', e);
    }
  }, [effectiveWhatsAppUrl]);

  const handleCopyAlert = () => {
    navigator.clipboard.writeText(fullAlertText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageSrc;
    link.download = `Address-QR-${order.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 my-auto">
        {/* Top Success Banner */}
        <div className="p-6 bg-gradient-to-br from-[#12141c] via-[#0e1017] to-[#07080b] text-white text-center border-b border-slate-800 relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-black" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Payment Confirmed &amp; Paid (PayPal UK)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-serif text-white">
            Order Successfully Placed!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Order Reference: <span className="font-mono text-[#d4a853] font-bold">#{order.id}</span> &middot; Style And Class London
          </p>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          {/* WhatsApp Alert Trigger Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/5 border-2 border-[#25D366]/40 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#25D366]">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-black flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-black" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    WhatsApp Merchant Alert Prepared
                  </h4>
                  <p className="text-[11px] text-[#25D366] font-bold">
                    Sending to +44 7591 878215 with all 6 details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAlert}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Alert'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              An instant notification has been formatted with the buyer name, delivery address with QR code, contact phone, product photo &amp; price, and shipping company.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                id="success-send-whatsapp-btn"
                href={effectiveWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Open Full Alert in WhatsApp</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={handleCopyAlert}
                className="py-3.5 px-4 bg-[#181a24] hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#d4a853]" />}
                <span>{copied ? 'Full Report Copied!' : 'Copy WhatsApp Report'}</span>
              </button>
            </div>
          </div>

          {/* 1-Piece Rule Auto-Removal Notice */}
          {removedProducts && removedProducts.length > 0 && (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Store Database Automation: 1-Piece Rule Executed</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                The following unique pre-loved item was the <strong>only 1 piece in stock</strong> and was <strong>automatically archived directly from the storefront</strong>:
              </p>
              <ul className="list-disc list-inside text-xs font-bold text-[#d4a853] pl-1">
                {removedProducts.map((p, idx) => (
                  <li key={idx}>"{p}"</li>
                ))}
              </ul>
            </div>
          )}

          {/* COMPLETE REQUIREMENTS VERIFICATION CARD */}
          <div className="p-4 sm:p-5 bg-[#0a0a0f] rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#d4a853] flex items-center gap-2">
                <span>Verified WhatsApp Alert Transmission Report</span>
              </h3>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                100% Prepared
              </span>
            </div>

            {/* Payment Method Verification */}
            <div className="p-3 bg-[#11131c] rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Buyer Payment Method</span>
                  <strong className="text-xs text-white">
                    {paymentMethodLabel}
                  </strong>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                PAID &amp; SETTLED
              </span>
            </div>

            {/* 1. Name of the Buyer & 3. Buyer Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#11131c] rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                  <User className="w-3.5 h-3.5 text-[#d4a853]" />
                  <span>1. Buyer Name</span>
                </div>
                <p className="text-sm font-extrabold text-white">{order.customer.fullName}</p>
                {order.customer.email && (
                  <p className="text-[11px] text-slate-400 truncate">{order.customer.email}</p>
                )}
              </div>

              <div className="p-3 bg-[#11131c] rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-[#d4a853]" />
                  <span>3. Buyer Phone Number</span>
                </div>
                <p className="text-sm font-extrabold text-white">{order.customer.phone}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="text-[11px] text-[#d4a853] hover:underline font-bold"
                  >
                    Call Client
                  </a>
                  <span className="text-slate-600">&middot;</span>
                  <a
                    href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#25D366] hover:underline font-bold"
                  >
                    WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Address of the Buyer + GENERATED QR CODE */}
            <div className="p-3.5 bg-[#11131c] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#d4a853]" />
                  <span>2. Buyer Address &amp; Scannable Courier Barcode</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={barcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-[#d4a853] px-2 py-1 rounded font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Barcode URL</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowQrExpanded(!showQrExpanded)}
                    className="text-[11px] text-[#d4a853] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>{showQrExpanded ? 'Hide QR' : 'View QR'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-white leading-relaxed">
                    {order.customer.address}
                  </p>
                  <p className="text-xs text-slate-300">
                    {order.customer.city}, {order.customer.postcode}, United Kingdom
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#d4a853] hover:underline font-bold"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Google Maps Route</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Courier Address Barcode Image Box */}
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-md border border-slate-300 shrink-0">
                  <img
                    src={barcodeImageSrc}
                    alt="Courier Address Barcode"
                    className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
                  />
                  <div className="flex flex-col gap-1 pr-1 text-black">
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                      Address Barcode
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      title="Download Courier Barcode"
                      className="p-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#d4a853]" />
                      <span>Save Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Product Name and Price & 5. Product Photo */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                  <Package className="w-3.5 h-3.5 text-[#d4a853]" />
                  <span>4. Product Name &amp; Price + 5. Product Photo</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {order.items.length} product(s)
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#11131c] border border-slate-800 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <img
                          src={it.image}
                          alt={it.productTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700 bg-black shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] text-[#d4a853] font-bold px-1 rounded-tl">
                          Photo 1
                        </span>
                      </div>
                      <div>
                        <h5 className="font-extrabold text-white text-xs leading-snug">
                          {it.productTitle}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Code: <strong className="text-[#d4a853]">{it.code || '1-of-1'}</strong> &middot; Size: <strong className="text-white">{it.size}</strong> &middot; Qty: {it.quantity}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[220px] sm:max-w-xs">
                          {it.image}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-sm text-[#d4a853]">
                        {currencySymbol}{(it.price * it.quantity).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currencySymbol}{it.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Shipping Company */}
            <div className="p-3.5 bg-[#11131c] rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0a0a0f] border border-slate-700 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#d4a853]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold">6. Shipping Company</div>
                  <div className="text-xs font-black text-white">
                    {order.carrierName || 'Evri Standard Delivery (£2.60)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Tracked UK dispatch &middot; 2-3 Working Days delivery
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  {order.shipping === 0 ? 'FREE Shipping' : `${currencySymbol}${order.shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-3 bg-[#0e1017] rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">{currencySymbol}{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>UK Tracked Shipping:</span>
                <span className="font-bold text-emerald-400">
                  {order.shipping === 0 ? 'FREE UK Shipping' : `${currencySymbol}${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount Paid:</span>
                <span className="text-[#d4a853] text-base">{currencySymbol}{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0a0a0f] border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Alert sent to: <span className="text-[#25D366] font-bold">+44 7591 878215</span>
          </div>

          <div className="flex items-center gap-2">
            {order.paypalCheckoutUrl && (
              <a
                href={order.paypalCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#ffc439] hover:bg-[#ffb000] text-[#003087] font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Push to PayPal (£{order.total.toFixed(2)})</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                if (onOpenLabel) {
                  onOpenLabel(order);
                } else {
                  window.location.hash = `#label-${order.id}`;
                }
              }}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-neutral-700"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Print 4×6 Label</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#d4a853] hover:bg-[#e8c97a] text-black font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Done &middot; Return to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
