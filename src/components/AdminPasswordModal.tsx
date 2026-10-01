import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, KeyRound, Check } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STORE_ADMIN_SECRET = '1123581321';

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === STORE_ADMIN_SECRET) {
      setErrorMessage('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onSuccess();
      }, 400);
    } else {
      setErrorMessage('Access Denied: Incorrect Brain Authorization Key.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0e1017] border border-[#d4a853]/60 rounded-2xl w-full max-w-md shadow-2xl shadow-black/90 p-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4a853] to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          aria-label="Close Security Shield"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center pt-2 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#d4a853]/15 border border-[#d4a853]/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-[#d4a853]" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider font-serif">
            Store Brain Authorization
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter master key to access database, live inventory &amp; store settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Store Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
                placeholder="Enter password"
                className="w-full bg-[#13151f] border border-slate-700 focus:border-[#d4a853] focus:ring-1 focus:ring-[#d4a853] rounded-xl px-4 py-3 text-sm text-white font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-600 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-400 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>Master Key Verified. Unlocking Brain...</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || isSuccess}
              className="flex-1 py-2.5 px-4 bg-[#d4a853] hover:bg-[#c29642] disabled:opacity-50 disabled:hover:bg-[#d4a853] text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Database</span>
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            Protected by Style &amp; Class Master Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
