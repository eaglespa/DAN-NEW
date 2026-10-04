import React from 'react';
import { z } from 'zod';
import { User, Phone, MapPin, Building, Home } from 'lucide-react';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(8, 'Valid phone number is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(3, 'Postal code is required')
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressInputProps {
  values: AddressFormData;
  onChange: (field: keyof AddressFormData, value: string) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  values,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-slate-300 font-bold text-xs mb-1">
          Full Recipient Name *
        </label>
        <div className="relative">
          <input
            type="text"
            value={values.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="e.g. Charlotte Kensington"
            className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none pl-9 transition-colors ${
              errors.fullName ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
            }`}
          />
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>
        {errors.fullName && <p className="text-[10px] text-amber-400 mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-slate-300 font-bold text-xs mb-1">
          Mobile Phone Number (for WhatsApp Dispatch Notification &amp; Courier) *
        </label>
        <div className="relative">
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+44 7700 900123"
            className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none pl-9 font-mono transition-colors ${
              errors.phone ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
            }`}
          />
          <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
        </div>
        {errors.phone && <p className="text-[10px] text-amber-400 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-slate-300 font-bold text-xs mb-1">
          Street Address &amp; House/Flat Number *
        </label>
        <div className="relative">
          <input
            type="text"
            value={values.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="e.g. Flat 4, 25 High Street"
            className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none pl-9 transition-colors ${
              errors.address ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
            }`}
          />
          <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>
        {errors.address && <p className="text-[10px] text-amber-400 mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-bold text-xs mb-1">
            Town / City *
          </label>
          <div className="relative">
            <input
              type="text"
              value={values.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="e.g. London"
              className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none pl-9 transition-colors ${
                errors.city ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
              }`}
            />
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
          {errors.city && <p className="text-[10px] text-amber-400 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-slate-300 font-bold text-xs mb-1">
            Postcode *
          </label>
          <div className="relative">
            <input
              type="text"
              value={values.postcode}
              onChange={(e) => onChange('postcode', e.target.value.toUpperCase())}
              placeholder="e.g. W1J 0LF"
              className={`w-full text-xs p-3 rounded-xl border bg-[#0a0a0f] text-white focus:outline-none pl-9 uppercase font-mono transition-colors ${
                errors.postcode ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 focus:border-[#d4a853]'
              }`}
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
          {errors.postcode && <p className="text-[10px] text-amber-400 mt-1">{errors.postcode}</p>}
        </div>
      </div>
    </div>
  );
};
