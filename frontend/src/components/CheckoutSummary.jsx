import React from 'react';
import { ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CheckoutSummary() {
  const {
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    platformFee,
    total,
    totalItemsCount,
  } = useCart();

  return (
    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Order Summary
            </h4>
            {restaurantName && (
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                {restaurantName}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-white border border-stone-200">
          {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items list */}
      <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
        {items.map((item) => {
          const itemId = item.id || item._id || item.menuItemId;
          const lineTotal = (item.price || 0) * item.quantity;
          return (
            <div
              key={itemId}
              className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2"
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-900 truncate block">
                  {item.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Qty: {item.quantity} x ₹{item.price}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">
                ₹{lineTotal}
              </span>
            </div>
          );
        })}
      </div>

      {/* Calculations */}
      <div className="space-y-1.5 pt-2 border-t border-stone-200 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Items Subtotal</span>
          <span className="font-mono font-semibold text-slate-900">₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-slate-600 items-center">
          <div className="flex items-center gap-1.5">
            <span>Delivery Partner Fee</span>
            {deliveryFee === 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={1.75} />
                CAMPUS500
              </span>
            )}
          </div>
          {deliveryFee === 0 ? (
            <span className="font-mono font-bold text-emerald-600 uppercase text-[11px]">
              FREE
            </span>
          ) : (
            <span className="font-mono font-semibold text-slate-900">
              ₹{deliveryFee}
            </span>
          )}
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Platform & Taxes</span>
          <span className="font-mono font-semibold text-slate-900">₹{platformFee}</span>
        </div>

        <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
          <div>
            <span className="font-extrabold text-slate-900 text-sm">Total Pay</span>
            <span className="text-[10px] text-slate-500 block">Inclusive of all taxes</span>
          </div>
          <span className="font-mono font-extrabold text-[#EA580C] text-lg">
            ₹{total}
          </span>
        </div>
      </div>

      {/* Guarantee Pill */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-center pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
        <span>100% Secure Campus Delivery · Guaranteed Fresh</span>
      </div>
    </div>
  );
}
