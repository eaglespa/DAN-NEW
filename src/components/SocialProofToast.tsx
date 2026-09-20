import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const NOTIFICATIONS = [
  { name: 'James W.', city: 'Manchester', time: '3 mins ago', size: 'UK 9' },
  { name: 'Oliver B.', city: 'London', time: '7 mins ago', size: 'UK 10' },
  { name: 'Callum T.', city: 'Edinburgh', time: '12 mins ago', size: 'UK 8.5' },
  { name: 'George P.', city: 'Birmingham', time: '18 mins ago', size: 'UK 9.5' }
];

export const SocialProofToast: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show after 4 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    // Loop notifications every 18 seconds
    const loopInterval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
        setVisible(true);
      }, 2000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopInterval);
    };
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const current = NOTIFICATIONS[index];

  return (
    <div className="fixed bottom-20 left-4 z-30 max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-neutral-200 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <img
        src="/images/sneaker_black_white_main_1789927468047.jpg"
        alt="Recent buyer"
        className="w-10 h-10 object-cover rounded-xl border border-neutral-200 flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-neutral-900 leading-tight">
          {current.name} in {current.city}
        </p>
        <p className="text-[10px] text-neutral-600 leading-tight mt-0.5">
          Purchased AirStride Mesh ({current.size})
        </p>
        <p className="text-[9px] text-neutral-400 mt-0.5">{current.time} • Verified UK Buyer</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-neutral-400 hover:text-neutral-700 p-1 -mr-1 -mt-4"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
