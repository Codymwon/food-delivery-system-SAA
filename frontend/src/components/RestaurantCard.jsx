import React from 'react';
import { Star, Clock, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

const RESTAURANT_OFFERS = {
  'rest-kfc': 'FLAT 30% OFF up to ₹75',
  'rest-bk': 'FLAT 25% OFF above ₹199',
  'rest-mcd': 'FREE McSpicy Fries on ₹299',
  'rest-dominos': '20% OFF on Gourmet Range',
  'rest-pizzahut': 'BUY 1 GET 1 on Pan Pizzas',
  'rest-behrouz': 'FLAT ₹100 OFF with code ROYAL',
  'rest-subway': 'SUB OF THE DAY at ₹179',
};

export default function RestaurantCard({ restaurant, onOpenMenu }) {
  const offer = RESTAURANT_OFFERS[restaurant.id] || 'Campus Student Special Available';

  return (
    <div
      onClick={() => onOpenMenu(restaurant)}
      className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Banner Image with Offer Overlay */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <img
            src={restaurant.bannerImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Dark gradient shadow on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Offer Pill at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-950/40">
              <Tag className="w-3.5 h-3.5" />
              <span>{offer}</span>
            </span>

            {/* Delivery Time Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{restaurant.deliveryTimeMinutes || 25} mins</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors leading-snug">
                {restaurant.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {restaurant.cuisine}
              </p>
            </div>

            {/* Rating Badge */}
            <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{restaurant.rating || 4.5}</span>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 text-slate-600">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
              <span>Min. Order: ₹{restaurant.minOrder || 100}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-orange-600 font-semibold group-hover:translate-x-1 transition-transform">
              <span>View Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
