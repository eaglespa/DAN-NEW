import React from 'react';
import { Truck, Check } from 'lucide-react';

export interface ShippingCarrierOption {
  id: string;
  name: string;
  cost: number;
  deliveryTime: string;
  badge?: string;
}

interface ShippingSelectorProps {
  selectedCarrierId: string;
  onSelectCarrier: (carrierId: string) => void;
  subtotal: number;
  freeShippingThreshold?: number;
}

export const DEFAULT_CARRIERS: ShippingCarrierOption[] = [
  {
    id: 'evri',
    name: 'Evri Standard Tracked',
    cost: 2.60,
    deliveryTime: '2-3 Working Days',
    badge: 'Popular'
  },
  {
    id: 'inpost',
    name: 'InPost 24/7 Locker / Shop',
    cost: 2.89,
    deliveryTime: '2-3 Working Days',
    badge: 'Eco'
  },
  {
    id: 'royalmail',
    name: 'Royal Mail 48 Tracked',
    cost: 3.65,
    deliveryTime: '1-2 Working Days',
    badge: 'Fast'
  }
];

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  selectedCarrierId,
  onSelectCarrier,
  subtotal,
  freeShippingThreshold = 45.0
}) => {
  const isFree = subtotal >= freeShippingThreshold;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#d4a853]" />
          Select Shipping Carrier
        </span>
        {isFree && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Free Shipping Applied (£45+)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {DEFAULT_CARRIERS.map((c) => {
          const isSelected = selectedCarrierId === c.id;
          const displayCost = isFree ? 0 : c.cost;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCarrier(c.id)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#d4a853] bg-[#161823] ring-1 ring-[#d4a853] shadow-md shadow-[#d4a853]/10'
                  : 'border-slate-800 bg-[#0a0a0f] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-white truncate">{c.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#d4a853] shrink-0" />}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono font-bold text-[#d4a853]">
                  {isFree ? 'FREE' : `£${displayCost.toFixed(2)}`}
                </span>
                <span className="text-[10px] text-slate-400">{c.deliveryTime}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
