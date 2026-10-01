import React, { useState } from 'react';
import { Printer, ArrowLeft, Download, ExternalLink, QrCode, Check, Copy, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface ShippingLabelViewProps {
  order: Order | null;
  ordersList?: Order[];
  onSelectOrder?: (order: Order) => void;
  onBack: () => void;
}

// Generate deterministic SVG barcode bars from a string
function BarcodeSvg({ value, height = 48 }: { value: string; height?: number }) {
  // Convert string to pattern of bar widths
  const cleanVal = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const bars: { width: number; isBlack: boolean }[] = [];

  // Start quiet zone & guard bars
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 2, isBlack: false });

  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const b2 = ((code >> 1) % 3) + 1;
    const b3 = ((code >> 2) % 2) + 1;
    const b4 = ((code >> 3) % 2) + 1;

    bars.push({ width: b1, isBlack: true });
    bars.push({ width: b2, isBlack: false });
    bars.push({ width: b3, isBlack: true });
    bars.push({ width: b4, isBlack: false });
  }

  // End guard bars
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      className="w-full max-w-[280px] h-12 mx-auto"
      preserveAspectRatio="none"
    >
      {bars.map((bar, idx) => {
        const x = currentX;
        currentX += bar.width;
        if (!bar.isBlack) return null;
        return <rect key={idx} x={x} y={0} width={bar.width} height={height} fill="#000000" />;
      })}
    </svg>
  );
}

export const ShippingLabelView: React.FC<ShippingLabelViewProps> = ({
  order,
  ordersList = [],
  onSelectOrder,
  onBack
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback sample order if none provided
  const activeOrder: Order = order || {
    id: 'SAC-671132',
    createdAt: '2026-09-29T18:57:12.000Z',
    items: [
      {
        productId: 'prod-3',
        productTitle: "WOMEN'S SWEATER [BOX 1-3]",
        color: 'Cream Cable',
        size: 'S (UK 8–10)',
        quantity: 1,
        price: 6.0,
        image: '/assets/BOX1-3_1788976608814_1.jpg',
        code: 'BOX 1-3',
        brand: 'LAUREN Ralph Lauren'
      }
    ],
    customer: {
      fullName: 'Bogdan Petrykowski',
      phone: '07591878215',
      address: '19 rutland road',
      city: 'london',
      postcode: 'UB34AG'
    },
    carrier: 'inpost',
    carrierName: 'InPost Locker / Shop',
    subtotal: 6.0,
    shipping: 2.89,
    discount: 0,
    total: 8.89,
    currency: 'GBP',
    paymentMethod: 'card_uk',
    paymentStatus: 'completed',
    whatsappNotified: true,
    addressQrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=19%20rutland%20road%2C%20london%2C%20UB34AG%2C%20United%20Kingdom',
    notes: 'PAID ALREADY via Debit / Credit Card (UK Secured)'
  };

  const fullAddress = `${activeOrder.customer.address}, ${activeOrder.customer.city}, ${activeOrder.customer.postcode}, United Kingdom`;
  const cleanPhone = (activeOrder.customer.phone || '').replace(/[^0-9+]/g, '');
  const qrImageSrc =
    activeOrder.addressQrDataUrl ||
    activeOrder.addressQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fullAddress)}`;

  const barcodeValue = `${activeOrder.id.replace(/[^A-Za-z0-9]/g, '')}UK`;

  // Carrier styling
  const carrierKey = (activeOrder.carrier || '').toLowerCase();
  let carrierBadgeText = 'PRIORITY TRACKED';
  let carrierTitle = 'EVRI TRACKED';

  if (carrierKey.includes('inpost')) {
    carrierTitle = 'INPOST LOCKER / SHOP';
    carrierBadgeText = 'TRACKED 24/7';
  } else if (carrierKey.includes('royal')) {
    carrierTitle = 'ROYAL MAIL 48';
    carrierBadgeText = 'TRACKED DELIVERY';
  } else {
    carrierTitle = 'EVRI TRACKED';
    carrierBadgeText = 'PRIORITY TRACKED';
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `ORDER #${activeOrder.id}
SHIP TO:
${activeOrder.customer.fullName}
${activeOrder.customer.address}
${activeOrder.customer.city}, ${activeOrder.customer.postcode}
TEL: ${activeOrder.customer.phone}
CARRIER: ${activeOrder.carrierName}
ITEMS: ${activeOrder.items.map((it) => `${it.productTitle} (${it.size}) x${it.quantity}`).join(', ')}
TOTAL: £${activeOrder.total.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 py-6 px-4 print:p-0 print:bg-white">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div className="flex items-center gap-2">
          {ordersList.length > 1 && onSelectOrder && (
            <select
              value={activeOrder.id}
              onChange={(e) => {
                const found = ordersList.find((o) => o.id === e.target.value);
                if (found) onSelectOrder(found);
              }}
              className="text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {ordersList.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.customer.fullName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            title="Copy address details"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          {activeOrder.paypalCheckoutUrl && (
            <a
              href={activeOrder.paypalCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#003087] bg-[#ffc439] hover:bg-[#ffb000] rounded-lg shadow-sm transition-all"
              title="Push transaction directly to PayPal merchant account"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Push to PayPal (£{activeOrder.total.toFixed(2)})</span>
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-neutral-800 rounded-lg shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Label (10×15cm)
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto mb-3 text-center no-print">
        <span className="text-xs font-medium text-neutral-500 tracking-wide uppercase">
          Standard 4×6" / 100×150mm Thermal Ready · 203/300 DPI
        </span>
      </div>

      {/* ============================================================== */}
      {/* 4x6" / 100x150mm Thermal Shipping Label Card                    */}
      {/* ============================================================== */}
      <div
        id="thermal-shipping-label"
        className="print-label-container max-w-[420px] w-full mx-auto bg-white border-2 border-black rounded-sm shadow-md print:shadow-none print:border-2 print:border-black p-5 font-sans text-black select-text"
        style={{
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between pb-3 border-b-2 border-black">
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase leading-none font-serif">
              STYLE &amp; CLASS
            </h1>
            <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-700 uppercase mt-0.5">
              LONDON · SUSTAINABLE LUXURY
            </p>
          </div>

          <div className="text-right">
            <div className="bg-black text-white px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider inline-block">
              {carrierTitle}
            </div>
            <p className="text-[8px] font-black tracking-widest text-neutral-600 uppercase mt-0.5 text-right">
              {carrierBadgeText}
            </p>
          </div>
        </div>

        {/* SHIP TO / DELIVER TO */}
        <div className="py-3 border-b-2 border-black">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-600 mb-1">
            SHIP TO / DELIVER TO:
          </p>
          <div className="space-y-0.5">
            <p className="text-base font-black uppercase tracking-wide leading-tight">
              {activeOrder.customer.fullName}
            </p>
            <p className="text-xs font-semibold uppercase leading-snug">
              {activeOrder.customer.address}
            </p>
            <p className="text-sm font-black uppercase tracking-wide leading-tight">
              {activeOrder.customer.city}, {activeOrder.customer.postcode}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              UNITED KINGDOM
            </p>
            <p className="text-xs font-semibold tracking-wide text-neutral-700 pt-0.5">
              TEL: {activeOrder.customer.phone}
            </p>
          </div>
        </div>

        {/* Barcode & Postal Routing Section */}
        <div className="py-3 border-b-2 border-black text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 text-center">
              <BarcodeSvg value={barcodeValue} height={46} />
              <p className="text-[11px] font-mono font-black tracking-[0.18em] uppercase mt-1">
                ORDER #{activeOrder.id}
              </p>
            </div>

            {/* Address QR code for courier scan & GPS navigation */}
            <div className="w-16 h-16 shrink-0 border border-black p-0.5 rounded-xs bg-white">
              <img
                src={qrImageSrc}
                alt="Address QR Code"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
            SCAN QR FOR ADDRESS GPS ROUTING &amp; DISPATCH RECORD
          </p>
        </div>

        {/* Package Contents & Items Details */}
        <div className="py-3 border-b-2 border-dashed border-black">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider pb-1">
            <span>
              PACKAGE CONTENTS ({activeOrder.items.reduce((s, it) => s + it.quantity, 0)}{' '}
              {activeOrder.items.reduce((s, it) => s + it.quantity, 0) === 1 ? 'ITEM' : 'ITEMS'})
            </span>
            <span>TOTAL: £{activeOrder.total.toFixed(2)} GBP</span>
          </div>

          <div className="space-y-2 pt-1">
            {activeOrder.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.productTitle}
                      className="w-8 h-8 rounded object-cover border border-neutral-300 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] uppercase truncate">
                      • {it.productTitle} {it.code ? `[${it.code}]` : ''}
                    </p>
                    <p className="text-[10px] text-neutral-600 truncate">
                      {it.brand || 'Boutique Piece'} · Size: {it.size || 'Standard'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-[11px]">Qty: {it.quantity}</span>
                  <p className="text-[10px] font-bold">£{Number(it.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Payment & Dispatch Information */}
        <div className="pt-2 text-[9px] text-neutral-600 space-y-0.5">
          <div className="flex items-center justify-between font-bold text-neutral-900 text-[10px]">
            <span>STATUS: PAID IN FULL</span>
            <span>{activeOrder.carrierName}</span>
          </div>
          <p className="text-neutral-500">
            Payment: {activeOrder.notes || 'Secured Debit/Credit Card / PayPal UK'}
          </p>
          <div className="flex items-center justify-between text-neutral-400 pt-1 text-[8px]">
            <span>Date: {new Date(activeOrder.createdAt).toLocaleString('en-GB')}</span>
            <span>Style &amp; Class London · +44 7591 878215</span>
          </div>
        </div>
      </div>

      {/* Global CSS for 4x6 / 100x150mm Thermal Printing */}
      <style>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-label-container {
            width: 100mm !important;
            max-width: 100mm !important;
            min-height: 148mm !important;
            margin: 0 auto !important;
            border: 2px solid #000000 !important;
            padding: 5mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShippingLabelView;
