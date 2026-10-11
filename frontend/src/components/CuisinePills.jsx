import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All', image: '/images/photo-1504674900247-0877df9cc836.jpg' },
  { id: 'burgers', label: 'Burgers', query: 'burger', image: '/images/photo-1568901346375-23c9450c58cd.jpg' },
  { id: 'pizzas', label: 'Pizzas', query: 'pizza', image: '/images/photo-1513104890138-7c749659a591.jpg' },
  { id: 'biryani', label: 'Biryani', query: 'biryani', image: '/images/photo-1563379091339-03b21ab4a4f8.jpg' },
  { id: 'chicken', label: 'Fried Chicken', query: 'chicken', image: '/images/photo-1513639776629-7b61b0ac49cb.jpg' },
  { id: 'subs', label: 'Subs & Salads', query: 'sub', image: '/images/photo-1509722747041-616f39b57569.jpg' },
  { id: 'sides', label: 'Sides & Fries', query: 'sides', image: '/images/photo-1576107232684-1279f3908594.jpg' },
  { id: 'desserts', label: 'Desserts', query: 'desserts', image: '/images/photo-1606313564200-e75d5e30476c.jpg' },
  { id: 'drinks', label: 'Drinks & Shakes', query: 'drink', image: '/images/photo-1572490122747-3968b75cc699.jpg' },
];

export default function CuisinePills({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none py-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id, cat.query)}
              className={`group shrink-0 flex flex-col items-center gap-2 p-2 rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-orange-500 ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-bold'
                  : 'bg-white hover:bg-stone-50 text-slate-700 font-medium border border-stone-200/80 shadow-xs'
              }`}
            >
              {/* Circular Thumbnail with Active Ring */}
              <div
                className={`w-14 h-14 rounded-full overflow-hidden p-0.5 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'ring-2 ring-[#EA580C] ring-offset-2 ring-offset-white shadow-md'
                    : 'border border-stone-200'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>

              <span className="text-xs text-center whitespace-nowrap">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
