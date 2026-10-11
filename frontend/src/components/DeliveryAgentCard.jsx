import React from 'react';
import {
  Phone,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Bike,
  Navigation,
} from 'lucide-react';

export default function DeliveryAgentCard({
  partnerName = 'Ramesh Kumar',
  partnerPhone = '+91 98765 43210',
  status = 'ASSIGNED',
  etaMinutes = 25,
  currentLocation = null,
}) {
  const locationText =
    typeof currentLocation === 'string'
      ? currentLocation
      : currentLocation?.text ||
        (status === 'DELIVERED'
          ? 'Delivered at Hostel Block D security desk'
          : status === 'OUT_FOR_DELIVERY'
          ? 'En route to Hostel Block D, VIT Vellore'
          : 'Assigned partner heading to restaurant');

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center">
            <Bike className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Campus Delivery Partner
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Delivery Fleet Service (:5006)
            </span>
          </div>
        </div>

        {/* Live ETA Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
          <span>
            {status === 'DELIVERED'
              ? 'Delivered'
              : `ETA: ${etaMinutes} mins`}
          </span>
        </div>
      </div>

      {/* Driver Details Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/90">
        <div className="flex items-center gap-3.5">
          {/* Avatar with status dot */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              RK
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {partnerName}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-stone-200 text-slate-700 text-[10px] font-semibold">
                Campus Verified
              </span>
            </div>

            {/* Rating with Lucide Star SVG (no emojis) */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={1.75} />
                <span>4.9</span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-500">
                840 deliveries completed
              </span>
            </div>
          </div>
        </div>

        {/* Call Rider CTA Button */}
        <a
          href={`tel:${partnerPhone.replace(/\s+/g, '')}`}
          className="btn-tactile inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-800 border border-stone-300 font-bold text-xs shadow-xs transition-colors cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500"
          title="Direct telephone action to delivery partner"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
          <span>Call Rider ({partnerPhone})</span>
        </a>
      </div>

      {/* Live Location Telemetry Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-orange-50/60 border border-orange-200/80 text-xs text-orange-950">
        <Navigation className="w-4 h-4 text-orange-600 shrink-0 mt-0.5 animate-pulse" strokeWidth={1.75} />
        <div className="min-w-0">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            Live GPS Telemetry
          </span>
          <p className="text-xs text-slate-700 font-medium mt-0.5">
            {locationText}
          </p>
        </div>
      </div>
    </div>
  );
}
