import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, ChevronDown } from 'lucide-react';
import { StoreSettings } from '../types';

interface AnnouncementBarProps {
  settings: StoreSettings;
  currency: string;
  onCurrencyChange: (c: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  settings,
  currency,
  onCurrencyChange
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-[#0b0f19] text-white text-[12px] py-2.5 px-4 border-b border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Urgency timer pill */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
            <span>FLASH DEAL</span>
          </span>

          <div className="flex items-center gap-1 font-mono text-[11.5px] bg-slate-900/90 border border-slate-700/60 px-2 py-0.5 rounded-md text-amber-200 font-bold shadow-inner">
            <span>{format(timeLeft.hours)}</span>
            <span className="text-slate-500">:</span>
            <span>{format(timeLeft.minutes)}</span>
            <span className="text-slate-500">:</span>
            <span>{format(timeLeft.seconds)}</span>
          </div>

          <span className="hidden md:inline text-slate-600">|</span>

          <span className="text-slate-300 font-medium text-xs truncate">
            {settings.announcementText}
          </span>
        </div>

        {/* Right: Currency and Trust Badge */}
        <div className="flex items-center gap-4 text-slate-300 text-[11.5px]">
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official UK Store</span>
          </div>

          <div className="relative inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-full px-2.5 py-0.5">
            <span className="text-slate-400 text-[10.5px] mr-1.5 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-white text-[11px] font-bold focus:outline-none cursor-pointer pr-3"
            >
              <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
              <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
              <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
            </select>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 pointer-events-none absolute right-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
