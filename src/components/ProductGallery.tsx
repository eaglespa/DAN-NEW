import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ShieldCheck, Sparkles } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  title,
  activeImageIndex,
  onSelectImage
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectImage((activeImageIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectImage((activeImageIndex + 1) % images.length);
  };

  const currentImg = images[activeImageIndex] || images[0];

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Main Image Stage */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100/60 border border-slate-200/90 shadow-sm cursor-crosshair group transition-all"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            50% OFF FLASH
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[10.5px] font-bold px-3 py-1 rounded-full shadow-xs border border-slate-700/60">
            <span>🇬🇧</span>
            <span>UK STOCK · DISPATCH TODAY</span>
          </span>
        </div>

        {/* Zoom Hint Indicator */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 shadow-xs pointer-events-none group-hover:opacity-100 opacity-80 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
          <span>Hover to Zoom</span>
        </div>

        {/* Primary Image with Magnification */}
        <img
          src={currentImg}
          alt={`${title} - view ${activeImageIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
            isZoomed ? 'scale-175' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }
              : undefined
          }
          loading="eager"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-200/80 transition-all hover:scale-105"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-200/80 transition-all hover:scale-105"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Subtle bottom gradient shadow */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* Active Index Pill */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
          {activeImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Selector Strip */}
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
        {images.map((img, idx) => {
          const isActive = idx === activeImageIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                isActive
                  ? 'border-amber-500 ring-2 ring-amber-500/30 scale-[1.03] shadow-md'
                  : 'border-slate-200 hover:border-slate-400 bg-slate-50'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {isActive && (
                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Features Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-600 font-medium">
        <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
          👟 <strong>Ultra-Lightweight</strong> (280g)
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
          🌬️ <strong>Honeycomb Mesh</strong> Breathable
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
          🛡️ <strong>Anti-Slip TPR</strong> Grip Sole
        </div>
      </div>
    </div>
  );
};
