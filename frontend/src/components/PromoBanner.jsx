import React from 'react';
import { ArrowRight, Sparkles, Tag, Clock } from 'lucide-react';

export default function PromoBanner({ onOrderNow }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-r from-[#1C1917] via-[#292524] to-[#451A03] text-white shadow-xl border border-stone-800">
      {/* Warm Ambient Culinary Lighting Overlay */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#EA580C]/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-72 h-72 rounded-full bg-amber-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 lg:p-10 gap-6">
        
        {/* Left Copy & CTA */}
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Exclusive Offer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Crave it? We deliver in 25 mins.
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Freshly prepared meals from KFC, Burger King, Domino's, Behrouz Biryani & more straight to your hostel door.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Code: <strong className="text-amber-300 font-mono">CAMPUS20</strong> for 20% off</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-stone-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Average ETA: 20-25 mins</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onOrderNow}
              className="btn-tactile inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition-all focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Imagery with Floating Badge */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-64 sm:w-72 lg:w-80 h-44 sm:h-52">
            <img
              src="/images/photo-1568901346375-23c9450c58cd.jpg"
              alt="Delicious Campus Burger and Feast"
              className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-white/10"
              loading="lazy"
            />
            
            {/* 20% OFF Floating Circle Badge (Matches reference style) */}
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-[#EA580C] text-white flex flex-col items-center justify-center shadow-lg border-2 border-white ring-4 ring-orange-500/20">
              <span className="text-xs font-black leading-tight">20%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">OFF</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
