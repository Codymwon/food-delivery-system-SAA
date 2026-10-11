import React, { useState } from 'react';
import {
  X,
  MapPin,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  Plus,
  CheckCircle2,
  Sparkles,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/client';
import PaymentSelector from './PaymentSelector';
import CheckoutSummary from './CheckoutSummary';

const DEFAULT_ADDRESS = {
  id: 'addr-default',
  label: 'Hostel Room',
  street: 'Hostel Block D, Room 412',
  city: 'Vellore',
  zipCode: '632014',
  state: 'Tamil Nadu',
  isDefault: true,
};

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { user, profile } = useAuth();
  const { items, restaurantId, clearCart, total } = useCart();

  // Address selection state
  const availableAddresses = [
    DEFAULT_ADDRESS,
    ...(profile?.addresses?.map((a, idx) => ({
      id: a._id || a.id || `addr-${idx}`,
      label: a.label || 'Saved Address',
      street: a.street || 'Hostel Block D, Room 412',
      city: a.city || 'Vellore',
      zipCode: a.zipCode || '632014',
      state: a.state || 'Tamil Nadu',
      isDefault: false,
    })) || []),
  ];

  const [selectedAddressId, setSelectedAddressId] = useState('addr-default');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Leave with hostel security desk');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentAddress =
    availableAddresses.find((a) => a.id === selectedAddressId) || DEFAULT_ADDRESS;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add dishes before placing an order.');
      return;
    }

    if (!restaurantId) {
      setErrorMessage('No restaurant identified for this order.');
      return;
    }

    // Build items with strict validation (id, name, price, quantity)
    const formattedItems = items.map((it) => {
      const itId = it.id || it._id || it.menuItemId || 'item-unknown';
      return {
        id: String(itId),
        menuItemId: String(itId),
        name: String(it.name),
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
      };
    });

    const orderPayload = {
      userId: user?.userId || 'user-demo-1',
      restaurantId: restaurantId,
      items: formattedItems,
      deliveryAddress: {
        street: currentAddress.street.trim(),
        city: currentAddress.city.trim(),
        zipCode: currentAddress.zipCode.trim(),
      },
      paymentMethod: paymentMethod,
      deliveryInstructions: deliveryInstructions.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await createOrder(orderPayload);
      const placedOrderId = response.orderId;

      // Clear cart
      clearCart();

      // Trigger callback with order details
      if (onOrderPlaced) {
        onOrderPlaced(placedOrderId, response);
      }
      onClose();
    } catch (err) {
      console.error('[Checkout] Failed to place order:', err);
      const detail =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Order dispatch failed. Please try again.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                  Instant Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                  Saga Transaction
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Review your delivery address and payment before dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-bold block">Checkout Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Hostel Delivery Address</span>
              </label>
              <span className="text-[11px] text-slate-500">
                VIT Vellore Campus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {addr.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Select</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {addr.street}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {addr.city} - {addr.zipCode}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Hostel Delivery Instructions */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Hostel Drop-off Note / Gate Instructions</span>
              </label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Leave with hostel security desk, call upon reaching Block D"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <PaymentSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          {/* Section 3: Bill Summary */}
          <CheckoutSummary />
        </div>

        {/* Footer Action */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-stone-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Payable Amount
            </span>
            <span className="font-mono text-xl font-extrabold text-[#EA580C]">
              ₹{total}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Saga Transaction...</span>
                </>
              ) : (
                <>
                  <span>Place Order & Pay</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
