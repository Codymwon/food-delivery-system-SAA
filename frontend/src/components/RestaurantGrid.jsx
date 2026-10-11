import React from 'react';
import RestaurantCard from './RestaurantCard';
import { Search, Utensils, X } from 'lucide-react';

export default function RestaurantGrid({
  restaurants,
  searchQuery,
  setSearchQuery,
  onOpenMenu,
}) {
  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Restaurants
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
              {restaurants.length} Open
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real brands delivering hot food across VIT campus hostels
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <div className="flex items-center rounded-2xl bg-white border border-stone-200 px-4 py-2.5 shadow-xs focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search KFC, Whopper, Pizzas, Biryani..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Restaurant Cards */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id || restaurant._id}
              restaurant={restaurant}
              onOpenMenu={onOpenMenu}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No restaurants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No restaurant matching "{searchQuery}" was found. Try clearing your search or picking another cuisine category.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="btn-tactile px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </section>
  );
}
