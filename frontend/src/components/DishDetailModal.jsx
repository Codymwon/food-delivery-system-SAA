import React, { useState } from 'react';
import {
  X,
  Star,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function DishDetailModal({
  dish,
  onClose,
  onOpenRestaurantMenu,
  onAddedToCart,
}) {
  const { addItem, restaurantName: currentCartRestName } = useCart();

  const [portion, setPortion] = useState('regular'); // 'regular' | 'combo' | 'double'
  const [quantity, setQuantity] = useState(1);
  const [conflictPrompt, setConflictPrompt] = useState(false);

  if (!dish) return null;

  const portionOptions = [
    { id: 'regular', label: 'Regular Portion', priceOffset: 0 },
    { id: 'combo', label: 'Make it a Combo (+ Fries & Drink)', priceOffset: 99 },
    { id: 'double', label: 'Double Portion / Deluxe', priceOffset: 120 },
  ];

  const currentOption = portionOptions.find((p) => p.id === portion);
  const unitPrice = (dish.price || 0) + (currentOption?.priceOffset || 0);
  const totalPrice = unitPrice * quantity;

  const handleAdd = (force = false) => {
    const itemToAdd = {
      id: dish.id,
      name: `${dish.name}${portion !== 'regular' ? ` (${currentOption.label.split(' ')[0]})` : ''}`,
      price: unitPrice,
      imageUrl: dish.imageUrl,
      portion,
      menuItemId: dish.id,
    };

    const res = addItem(itemToAdd, { id: dish.restaurantId, name: dish.restaurantName }, force);
    if (res?.conflict) {
      setConflictPrompt(true);
      return;
    }

    onClose();
    if (onAddedToCart) {
      onAddedToCart({ id: dish.restaurantId, name: dish.restaurantName });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Top Image Banner */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-100 shrink-0">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {dish.restaurantName && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
              {dish.restaurantName}
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Header Info */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {dish.name}
                </h3>
                {dish.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{dish.subtitle}</p>
                )}
              </div>
              
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">₹{dish.price}</span>
                <div className="flex items-center gap-1 justify-end text-xs text-emerald-700 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>{dish.rating || 4.7}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-stone-100">
              {dish.description}
            </p>
          </div>

          {/* Portion Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Choose Portion / Add-On
            </label>
            <div className="space-y-2">
              {portionOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPortion(opt.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all ${
                    portion === opt.id
                      ? 'border-[#EA580C] bg-orange-50/70 text-slate-900 shadow-xs ring-1 ring-orange-500'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        portion === opt.id
                          ? 'border-[#EA580C] bg-[#EA580C] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {portion === opt.id && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                    </div>
                    <span>{opt.label}</span>
                  </div>

                  <span className="font-bold text-slate-800">
                    {opt.priceOffset > 0 ? `+₹${opt.priceOffset}` : 'Included'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conflict Warning Alert if restaurant doesn't match */}
          {conflictPrompt && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Replace items in cart?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Your cart currently contains dishes from <strong>{currentCartRestName}</strong>. You can only order from one restaurant at a time.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAdd(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  Clear & Add This Item
                </button>
                <button
                  type="button"
                  onClick={() => setConflictPrompt(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs"
                >
                  Keep Existing Cart
                </button>
              </div>
            </div>
          )}

          {/* Full Restaurant Menu Link */}
          {onOpenRestaurantMenu && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRestaurantMenu({ id: dish.restaurantId, name: dish.restaurantName });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
              >
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                <span>View full menu of {dish.restaurantName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 border border-stone-200 rounded-2xl p-1 bg-white shadow-xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <span className="w-6 text-center font-bold text-slate-900 text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={() => handleAdd(false)}
            className="btn-tactile flex-1 py-3.5 px-5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-between transition-all focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <span>Add to Cart</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
