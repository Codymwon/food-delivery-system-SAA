import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ShoppingBag,
  MapPin,
  Star,
} from 'lucide-react';
import { fetchOrderById, fetchDeliveryTracking } from '../api/client';
import StatusStepper from './StatusStepper';
import DeliveryAgentCard from './DeliveryAgentCard';
import ReviewModal from './ReviewModal';

export default function OrderTracker({
  orderId,
  onBackToRestaurants,
  onOpenOrders,
}) {
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showPaymentToast, setShowPaymentToast] = useState(false);
  const [prevOrderStatus, setPrevOrderStatus] = useState(null);

  // Poll order and delivery status every 2.5 seconds
  const refreshTracker = async () => {
    if (!orderId) return;

    try {
      const orderRes = await fetchOrderById(orderId);
      if (orderRes) {
        setOrder(orderRes);

        // Check if status transitioned to CONFIRMED
        if (prevOrderStatus === 'PENDING' && orderRes.status === 'CONFIRMED') {
          setShowPaymentToast(true);
          setTimeout(() => setShowPaymentToast(false), 5000);
        }
        setPrevOrderStatus(orderRes.status);
      }
    } catch (err) {
      console.warn('[OrderTracker] Order fetch error:', err.message);
    }

    try {
      const delRes = await fetchDeliveryTracking(orderId);
      if (delRes) {
        setDelivery(delRes);
      }
    } catch (err) {
      // Delivery record might not exist yet if payment is still pending
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTracker();
    const interval = setInterval(refreshTracker, 2500);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard?.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Determine aggregate progress stage
  const getComputedStage = () => {
    if (order?.status === 'CANCELLED') return 'CANCELLED';
    if (delivery?.status === 'DELIVERED') return 'DELIVERED';
    if (delivery?.status === 'OUT_FOR_DELIVERY') return 'OUT_FOR_DELIVERY';
    if (delivery?.status === 'ASSIGNED' || delivery?.status === 'PICKED_UP') return 'PREPARING';
    if (order?.status === 'CONFIRMED') return 'CONFIRMED';
    return 'PENDING';
  };

  const computedStage = getComputedStage();
  const isDelivered = computedStage === 'DELIVERED';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP BREADCRUMB & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBackToRestaurants}
            className="hover:text-slate-900 transition-colors"
          >
            Campus Restaurants
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={onOpenOrders}
            className="hover:text-slate-900 transition-colors"
          >
            My Orders
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900 font-mono">
            {orderId || 'Active Order'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={refreshTracker}
            className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 text-xs font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span>Poll Live Status</span>
          </button>

          <button
            type="button"
            onClick={onBackToRestaurants}
            className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs"
          >
            <span>Order More Food</span>
          </button>
        </div>
      </div>

      {/* 2. PAYMENT CONFIRMATION TOAST */}
      {showPaymentToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                Payment Authorized!
              </span>
              <span className="text-[11px] text-emerald-100">
                Payment of ₹{order?.totalAmount} has been confirmed. Your food is now being prepared.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentToast(false)}
            className="text-emerald-100 hover:text-white text-xs font-mono px-2 py-1 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. ORDER HERO CARD */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] font-mono font-bold text-xs">
                <span>{orderId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="hover:text-orange-950 transition-colors ml-1"
                  title="Copy Order ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                {computedStage}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {order?.restaurantId === 'rest-kfc'
                ? 'KFC Campus Express'
                : order?.restaurantId === 'rest-bk'
                ? 'Burger King VIT'
                : order?.restaurantId === 'rest-dominos'
                ? "Domino's Pizza Hub"
                : 'Campus Kitchen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'} · Delivering to {order?.deliveryAddress?.street || 'Hostel Block D, Room 412'}
            </p>
          </div>

          {/* Amount Badge */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col items-start sm:items-end">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Amount
            </span>
            <span className="font-mono text-2xl font-extrabold text-[#EA580C]">
              ₹{order?.totalAmount || '0'}
            </span>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">
              Payment: {order?.paymentId ? `Auth (${order.paymentId})` : 'Confirmed'}
            </span>
          </div>
        </div>

        {/* 5-STAGE STATUS STEPPER */}
        <StatusStepper
          currentStage={computedStage}
          isCancelled={order?.status === 'CANCELLED'}
        />

        {/* CELEBRATION BANNER IF DELIVERED */}
        {isDelivered && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/20 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base">
                  Order Successfully Delivered to Hostel Block D!
                </h4>
                <p className="text-xs text-emerald-100">
                  Your food has arrived at the hostel security gate. Enjoy your meal!
                </p>
              </div>
            </div>

            {hasReviewed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs">
                <Check className="w-4 h-4" />
                Review Submitted
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="btn-tactile px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-emerald-800 font-extrabold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Rate Your Experience & Leave Review</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* 4. DELIVERY PARTNER CARD & ORDER ITEMS DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Delivery Partner Card */}
        <DeliveryAgentCard
          partnerName={delivery?.partnerName || 'Ramesh Kumar'}
          partnerPhone={delivery?.partnerPhone || '+91 98765 43210'}
          status={delivery?.status || computedStage}
          etaMinutes={delivery?.etaMinutes || (isDelivered ? 0 : 25)}
          currentLocation={delivery?.currentLocation}
        />

        {/* Right Column: Ordered Items Breakdown Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Items in this Order
              </h4>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {order?.items?.length || 0} items
            </span>
          </div>

          <div className="space-y-2.5 divide-y divide-stone-100">
            {order?.items?.map((it, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{it.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    Qty: {it.quantity} x ₹{it.price}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(it.price || 0) * (it.quantity || 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery Location pill */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>
              Drop-off: <strong>{order?.deliveryAddress?.street || 'Hostel Block D, Room 412'}</strong>, {order?.deliveryAddress?.city || 'Vellore'} - {order?.deliveryAddress?.zipCode || '632014'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. SCREEN 5: REVIEW MODAL */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={orderId}
        restaurantId={order?.restaurantId || 'rest-kfc'}
        restaurantName={
          order?.restaurantId === 'rest-kfc'
            ? 'KFC Campus Express'
            : order?.restaurantId === 'rest-bk'
            ? 'Burger King VIT'
            : order?.restaurantId === 'rest-dominos'
            ? "Domino's Pizza Hub"
            : 'Campus Restaurant'
        }
        onReviewSubmitted={() => {
          setHasReviewed(true);
        }}
      />

    </div>
  );
}
