import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  hasStickyBar?: boolean;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ hasStickyBar = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-4 sm:left-6 z-40 transition-all duration-300 ease-in-out ${
        hasStickyBar ? 'bottom-24 sm:bottom-28' : 'bottom-6 sm:bottom-8'
      }`}
    >
      <button
        id="jump-to-top-btn"
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#13151f]/90 hover:bg-[#d4a853] text-[#d4a853] hover:text-black border border-[#d4a853]/50 hover:border-[#d4a853] shadow-lg shadow-black/60 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4a853]/50"
      >
        <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />

        {/* Tooltip */}
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#090a0f] text-[#d4a853] text-[11px] font-bold rounded-lg border border-[#d4a853]/40 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden sm:inline-block">
          Back to Top
        </span>
      </button>
    </div>
  );
};
