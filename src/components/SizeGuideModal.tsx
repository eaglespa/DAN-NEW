import React, { useState } from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize
}) => {
  const [guideCategory, setGuideCategory] = useState<'apparel' | 'footwear'>('apparel');

  if (!isOpen) return null;

  const apparelSizes = [
    { uk: 'UK 6', us: 'US 2', eu: 'EU 34', bust: '31 in / 79 cm', waist: '24 in / 61 cm', hips: '34 in / 86 cm' },
    { uk: 'UK 8', us: 'US 4', eu: 'EU 36', bust: '33 in / 84 cm', waist: '26 in / 66 cm', hips: '36 in / 91 cm' },
    { uk: 'UK 10', us: 'US 6', eu: 'EU 38', bust: '35 in / 89 cm', waist: '28 in / 71 cm', hips: '38 in / 97 cm' },
    { uk: 'UK 12', us: 'US 8', eu: 'EU 40', bust: '37 in / 94 cm', waist: '30 in / 76 cm', hips: '40 in / 102 cm' },
    { uk: 'UK 14', us: 'US 10', eu: 'EU 42', bust: '39 in / 99 cm', waist: '32 in / 81 cm', hips: '42 in / 107 cm' },
    { uk: 'UK 16', us: 'US 12', eu: 'EU 44', bust: '41 in / 104 cm', waist: '34 in / 86 cm', hips: '44 in / 112 cm' }
  ];

  const footwearSizes = [
    { uk: 'UK 4', eu: 'EU 37', us: 'US 6', length: '23.0 cm' },
    { uk: 'UK 5', eu: 'EU 38', us: 'US 7', length: '24.0 cm' },
    { uk: 'UK 6', eu: 'EU 39', us: 'US 8', length: '25.0 cm' },
    { uk: 'UK 7', eu: 'EU 40.5', us: 'US 9', length: '26.0 cm' },
    { uk: 'UK 8', eu: 'EU 42', us: 'US 10', length: '27.0 cm' },
    { uk: 'UK 9', eu: 'EU 43', us: 'US 11', length: '28.0 cm' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 text-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0a0f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181a24] border border-slate-700 flex items-center justify-center text-[#d4a853]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-serif">
                Style And Class Sizing &amp; Fit Guide
              </h3>
              <p className="text-[11px] text-slate-400">UK Standard Conversions &amp; Measurements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Category Toggle */}
          <div className="flex gap-2 p-1 bg-[#090a0f] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setGuideCategory('apparel')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                guideCategory === 'apparel'
                  ? 'bg-[#d4a853] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Garments &amp; Dresses
            </button>
            <button
              type="button"
              onClick={() => setGuideCategory('footwear')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                guideCategory === 'footwear'
                  ? 'bg-[#d4a853] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Footwear
            </button>
          </div>

          <div className="p-3 bg-[#0a0a0f] rounded-2xl border border-slate-800 text-slate-300 leading-relaxed">
            <p className="font-bold text-white mb-1">
              ✨ Pre-Loved Garment Precision Guarantee
            </p>
            <p>
              Each 1-of-1 piece in our London showroom is steam-sanitized, measured, and inspected. If an item does not fit to your satisfaction, our 7-day UK return policy covers you.
            </p>
          </div>

          {/* Sizing Table */}
          {guideCategory === 'apparel' ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090a0f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181a24] text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">UK Size</th>
                    <th className="py-2.5 px-3">US / EU</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {apparelSizes.map((row) => {
                    const isSelected = selectedSize === row.uk;
                    return (
                      <tr
                        key={row.uk}
                        className={isSelected ? 'bg-[#1e1c12] font-bold' : 'hover:bg-[#13151f]'}
                      >
                        <td className="py-2.5 px-3 text-white font-extrabold flex items-center gap-1.5">
                          {row.uk}
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a853]" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{row.us} &middot; {row.eu}</td>
                        <td className="py-2.5 px-3 text-slate-300">{row.bust}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">{row.waist}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSize(row.uk);
                              onClose();
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#d4a853] text-black'
                                : 'bg-[#181a24] text-slate-300 hover:bg-[#d4a853] hover:text-black'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090a0f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181a24] text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">UK Size</th>
                    <th className="py-2.5 px-3">EU Size</th>
                    <th className="py-2.5 px-3">US Size</th>
                    <th className="py-2.5 px-3">Length</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {footwearSizes.map((row) => {
                    const isSelected = selectedSize === row.uk;
                    return (
                      <tr
                        key={row.uk}
                        className={isSelected ? 'bg-[#1e1c12] font-bold' : 'hover:bg-[#13151f]'}
                      >
                        <td className="py-2.5 px-3 text-white font-extrabold flex items-center gap-1.5">
                          {row.uk}
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a853]" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{row.eu}</td>
                        <td className="py-2.5 px-3 text-slate-400">{row.us}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">{row.length}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSize(row.uk);
                              onClose();
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#d4a853] text-black'
                                : 'bg-[#181a24] text-slate-300 hover:bg-[#d4a853] hover:text-black'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
