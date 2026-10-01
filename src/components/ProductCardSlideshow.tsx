import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardSlideshowProps {
  images: string[];
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  autoPlayInterval?: number;
  onImageClick?: () => void;
  children?: React.ReactNode;
}

export const ProductCardSlideshow: React.FC<ProductCardSlideshowProps> = ({
  images = [],
  alt,
  className = '',
  aspectRatioClass = 'aspect-[3/4]',
  autoPlayInterval = 1600,
  onImageClick,
  children
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Fallback if images array is empty
  const safeImages = images && images.length > 0
    ? images
    : ['/assets/BOX1-1_1788975756099_1.jpg'];

  const hasMultipleImages = safeImages.length > 1;

  // Auto-slide when hovered
  useEffect(() => {
    if (!isHovered || !hasMultipleImages) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, hasMultipleImages, safeImages.length, autoPlayInterval]);

  // Touch Swipe for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe Right -> Prev
        setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
      } else {
        // Swipe Left -> Next
        setCurrentIndex((prev) => (prev + 1) % safeImages.length);
      }
    }
    touchStartXRef.current = null;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  // Horizontal mouse scrub across card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const targetIdx = Math.min(safeImages.length - 1, Math.floor(ratio * safeImages.length));
    if (targetIdx !== currentIndex) {
      setCurrentIndex(targetIdx);
    }
  };

  return (
    <div
      className={`relative ${aspectRatioClass} bg-[#0a0a0f] overflow-hidden select-none group/slideshow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onImageClick}
    >
      {/* Background/Base Image layer */}
      <img
        src={safeImages[currentIndex] || safeImages[0]}
        alt={`${alt} - Slide ${currentIndex + 1} of ${safeImages.length}`}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
      />

      {/* Subtle bottom gradient for readability */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Story-Style Segments Header Indicator (Top of card) */}
      {hasMultipleImages && (
        <div className="absolute top-2 inset-x-3 z-20 flex items-center gap-1 pointer-events-auto">
          {safeImages.map((_, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className="flex-1 h-1.5 py-0.5 cursor-pointer group/seg"
              title={`View slide ${idx + 1}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'bg-[#d4a853] shadow-xs shadow-[#d4a853]'
                    : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Left / Right Slideshow Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-lg border border-white/20 active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-lg border border-white/20 active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Photo Counter Pill (e.g. 1/2, 2/2) */}
          <div className="absolute bottom-2.5 right-3 z-10 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-300 border border-slate-700/60 pointer-events-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853]" />
            <span>
              {currentIndex + 1}/{safeImages.length}
            </span>
          </div>
        </>
      )}

      {/* Overlays / Badges / Buttons (Children) */}
      {children}
    </div>
  );
};
