import React, { useRef, useState } from 'react';
import {
  Star,
  Plus,
  Heart,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const POPULAR_CAMPUS_PICKS = [
  {
    id: 'item-bk-1',
    restaurantId: 'rest-bk',
    restaurantName: 'Burger King',
    name: 'Whopper® Meal',
    subtitle: 'Flame-grilled patty + Large Fries + Coke',
    description: 'Iconic flame-grilled beef or crispy patty topped with juicy tomatoes, crisp lettuce, creamy mayonnaise, pickles, and onions on a toasted sesame seed bun. Served with King Peri Peri fries and chilled drink.',
    price: 299,
    rating: 4.8,
    reviewCount: '1.2k',
    tag: 'BESTSELLER',
    tagColor: 'bg-purple-100 text-purple-700 border-purple-200',
    imageUrl: '/images/photo-1568901346375-23c9450c58cd.jpg',
    category: 'King Meals',
  },
  {
    id: 'item-kfc-1',
    restaurantId: 'rest-kfc',
    restaurantName: 'KFC',
    name: '8 Pcs Hot & Crispy Bucket',
    subtitle: 'Juicy bone-in chicken + 2 dips',
    description: 'Signature juicy bone-in chicken marinated in secret 11 herbs and spices, fried to golden crunchy perfection. Served with 2 dips.',
    price: 649,
    rating: 4.8,
    reviewCount: '2.5k',
    tag: 'POPULAR',
    tagColor: 'bg-orange-100 text-orange-700 border-orange-200',
    imageUrl: '/images/photo-1513639776629-7b61b0ac49cb.jpg',
    category: 'Buckets',
  },
  {
    id: 'item-ph-1',
    restaurantId: 'rest-pizzahut',
    restaurantName: 'Pizza Hut',
    name: 'Supreme Cheesy Pan Pizza',
    subtitle: 'Loaded black olives, mushrooms, peppers',
    description: 'Loaded with black olives, green bell peppers, red onions, mushrooms, and golden mozzarella on iconic buttery pan crust.',
    price: 419,
    rating: 4.7,
    reviewCount: '980',
    tag: 'SAVE 20%',
    tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    imageUrl: '/images/photo-1590947132387-155cc02f3212.jpg',
    category: 'Pan Pizzas',
  },
  {
    id: 'item-behrouz-1',
    restaurantId: 'rest-behrouz',
    restaurantName: 'Behrouz Biryani',
    name: 'Dum Gosht Shahi Biryani',
    subtitle: 'Boneless slow-dum mutton with saffron rice',
    description: 'Tender boneless mutton pieces slow-cooked in royal aromatic spices, layered with aged basmati rice and saffron. Served with Gulab Jamun and Raita.',
    price: 449,
    rating: 4.9,
    reviewCount: '1.8k',
    tag: 'ROYAL PICK',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    imageUrl: '/images/photo-1563379091339-03b21ab4a4f8.jpg',
    category: 'Royal Biryanis',
  },
  {
    id: 'item-mcd-1',
    restaurantId: 'rest-mcd',
    restaurantName: "McDonald's",
    name: 'McSpicy Chicken Burger Meal',
    subtitle: 'Spicy chicken burger + World Famous Fries + Drink',
    description: 'Tender chicken patty marinated in fiery batter, shredded lettuce, spicy mayo, with World Famous Fries and a drink.',
    price: 289,
    rating: 4.8,
    reviewCount: '3.1k',
    tag: 'BESTSELLER',
    tagColor: 'bg-purple-100 text-purple-700 border-purple-200',
    imageUrl: '/images/photo-1594212699903-ec8a3eca50f5.jpg',
    category: 'Meals',
  },
  {
    id: 'item-subway-1',
    restaurantId: 'rest-subway',
    restaurantName: 'Subway',
    name: 'Paneer Tikka Sub (6 inch)',
    subtitle: 'Tandoori paneer, crisp veggies & mint mayo',
    description: 'Tender paneer cubes marinated in tandoori seasoning with crisp veggies, mint mayo, and honey mustard on multi-grain bread.',
    price: 219,
    rating: 4.6,
    reviewCount: '750',
    tag: 'HEALTHY',
    tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    imageUrl: '/images/photo-1509722747041-616f39b57569.jpg',
    category: 'Subs',
  },
];

export default function PopularPicksRow({ onSelectDish, onAddDishAndNavigate }) {
  const rowRef = useRef(null);
  const [favorites, setFavorites] = useState({});

  const scroll = (direction) => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-4">
      {/* Section Header with Scroll Arrows */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#EA580C]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Popular Campus Picks
            </h2>
            <p className="text-xs text-slate-500">
              Most ordered dishes across campus hostels today
            </p>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="btn-tactile p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 shadow-xs transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="btn-tactile p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 shadow-xs transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Horizontally Scrolling Card Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
      >
        {POPULAR_CAMPUS_PICKS.map((dish) => {
          const isFav = !!favorites[dish.id];

          return (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="shrink-0 w-64 sm:w-72 bg-white rounded-3xl border border-stone-200/90 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              {/* Card Header: Badge & Favorite Button */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${dish.tagColor}`}
                  >
                    {dish.tag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, dish.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
                      strokeWidth={1.75}
                    />
                  </button>
                </div>

                {/* Appetizing Centered Dish Image */}
                <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 bg-stone-50">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                    {dish.restaurantName}
                  </div>
                </div>

                {/* Dish Name & Subtitle */}
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
                  {dish.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {dish.subtitle}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                    <span>{dish.rating}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({dish.reviewCount})
                  </span>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Price</span>
                  <div className="text-base font-extrabold text-slate-900">
                    ₹{dish.price}
                  </div>
                </div>

                {/* Circular Orange '+' Button matching Reference Images */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddDishAndNavigate) {
                      onAddDishAndNavigate(dish);
                    } else if (onSelectDish) {
                      onSelectDish(dish);
                    }
                  }}
                  className="btn-tactile w-9 h-9 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center shadow-md shadow-orange-600/30 transition-transform focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label={`Add ${dish.name} to cart`}
                >
                  <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
