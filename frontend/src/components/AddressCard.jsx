import React from 'react';
import { MapPin, CheckCircle2, GraduationCap, Briefcase, Home } from 'lucide-react';

export default function AddressCard({ address, onSelect, isSelected = false }) {
  const getIcon = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('hostel') || l.includes('vit') || l.includes('college')) {
      return GraduationCap;
    }
    if (l.includes('work') || l.includes('office') || l.includes('lab')) {
      return Briefcase;
    }
    return Home;
  };

  const Icon = getIcon(address.label);

  return (
    <div
      onClick={onSelect ? () => onSelect(address) : undefined}
      className={`p-4 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-blue-50/60 border-blue-500 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Icon className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                {address.label || 'Saved Location'}
              </span>
              {address.isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  DEFAULT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {address.street}, {address.city} - {address.zipCode}
            </p>
          </div>
        </div>

        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={2} />
        )}
      </div>
    </div>
  );
}
