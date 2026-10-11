import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MapPin,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, onToggle, onCheckout }) {
  const {
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    platformFee,
    total,
    totalItemsCount,
    updateQty,
    clearCart,
  } = useCart();

  const [deliveryNote, setDeliveryNote] = useState('');

  const isEmpty = items.length === 0;

  const handlePillClick = (e) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    } else if (isOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* 1. Light Dismiss Backdrop (Only active when cart pop-up card is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 2. Floating Corner Pop-up Card (Pops directly from the bottom pillow itself) */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 lg:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] ${
            totalItemsCount > 0 ? 'bottom-[5.25rem] sm:bottom-[5.5rem]' : 'bottom-6'
          } max-h-[min(540px,calc(100vh-7.5rem))] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] border border-stone-200/90 flex flex-col overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200`}
        >
          {/* Card Header */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">Your Cart</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isEmpty ? '0 items in tray' : `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'} in tray`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isEmpty && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Clear all items"
                  aria-label="Clear cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
                aria-label="Close cart popup"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {isEmpty ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-slate-300">
                  <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Explore campus favorites from KFC, Burger King, Domino's, Behrouz Biryani & add your favorite dishes.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-left flex items-start gap-2.5 text-xs text-orange-900 max-w-xs mx-auto">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Free doorstep delivery on orders over ₹500 with code <strong>CAMPUS20</strong></span>
                </div>
              </div>
            ) : (
              <>
                {/* Active Restaurant Pill */}
                {restaurantName && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-900 text-xs block truncate">{restaurantName}</span>
                      <span className="text-slate-500 text-[10px]">Direct Campus Kitchen</span>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-white text-orange-600 font-bold border border-orange-200 text-[9px]">
                      Active Store
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Items In Cart
                  </h4>
                  <div className="space-y-2 divide-y divide-stone-100">
                    {items.map((item) => {
                      const itemId = item.id || item._id || item.menuItemId;
                      const itemTotal = (item.price || 0) * item.quantity;

                      return (
                        <div
                          key={itemId}
                          className="pt-2 first:pt-0 flex items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate text-xs">
                              {item.name}
                            </div>
                            <div className="text-slate-500 text-[10px] mt-0.5">
                              ₹{item.price} each
                            </div>
                          </div>

                          {/* Compact Stepper */}
                          <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                            <button
                              type="button"
                              onClick={() => updateQty(itemId, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-orange-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" strokeWidth={2.5} />
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(itemId, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-orange-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" strokeWidth={2.5} />
                            </button>
                          </div>

                          <div className="font-extrabold text-slate-900 w-14 text-right text-xs">
                            ₹{itemTotal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Note */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Hostel Delivery Note</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Leave at hostel gate, Room 412"
                    className="w-full text-xs px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 text-slate-800 placeholder:text-slate-400 transition-colors"
                  />
                </div>

                {/* Bill Breakdown */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Bill Details
                  </div>

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-900">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Delivery Partner Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-600 uppercase text-[10px]">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Platform & Taxes</span>
                    <span className="font-semibold text-slate-900">₹{platformFee}</span>
                  </div>

                  <div className="pt-1.5 border-t border-stone-200 flex justify-between font-extrabold text-slate-900 text-sm">
                    <span>Total Pay</span>
                    <span className="text-[#EA580C]">₹{total}</span>
                  </div>
                </div>

                {/* Delivery Address Tag */}
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">Delivering to: <strong>Hostel Block D, Room 412</strong></span>
                </div>
              </>
            )}
          </div>

          {/* Card Footer CTA */}
          {!isEmpty && (
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-stone-100 bg-white space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCheckout) onCheckout();
                }}
                className="btn-tactile w-full py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 flex items-center justify-between transition-all focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1.5">
                  <span>₹{total}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Contactless campus delivery</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Floating Bottom Pillow (Persists in bottom-right corner when items are in tray) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 right-4 sm:right-6 lg:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] animate-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={handlePillClick}
            className={`btn-tactile w-full text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between cursor-pointer border backdrop-blur-md transition-all group ${
              isOpen
                ? 'bg-orange-950/95 border-orange-500/60 ring-4 ring-orange-500/25 shadow-orange-950/40'
                : 'bg-slate-900/95 hover:bg-slate-900 border-slate-700 ring-4 ring-orange-500/15'
            }`}
            aria-label={isOpen ? 'Close cart drawer' : 'View cart drawer'}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in tray</span>
                  {restaurantName && (
                    <span className="text-[10px] text-orange-400 font-normal truncate max-w-[120px] sm:max-w-[140px]">
                      · {restaurantName}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Subtotal: ₹{total}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 pl-2 shrink-0 group-hover:translate-x-0.5 transition-transform">
              <span>{isOpen ? 'Close Cart' : 'View Cart'}</span>
              {isOpen ? (
                <X className="w-4 h-4 text-white" strokeWidth={2.5} />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      )}
    </>
  );
}
