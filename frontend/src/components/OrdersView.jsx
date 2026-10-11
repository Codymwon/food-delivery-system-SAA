import React, { useState, useEffect } from 'react';
import {
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  Star,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { fetchUserOrders } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReviewModal from './ReviewModal';

export default function OrdersView({ onSelectOrder, onBrowseRestaurants }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const userId = user?.userId || 'user-demo-1';
      const data = await fetchUserOrders(userId);
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.warn('[OrdersView] Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.userId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-slate-800 border-stone-200';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Campus Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA580C] text-xs font-mono font-bold">
              Order Service (:5004)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active deliveries in real-time or review past hostel orders
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="btn-tactile self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 text-xs font-bold shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-stone-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#EA580C] flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" strokeWidth={1.75} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            You haven't placed any campus orders yet. Explore top restaurants like KFC, Burger King, or Behrouz Biryani to start!
          </p>
          <button
            type="button"
            onClick={onBrowseRestaurants}
            className="btn-tactile px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20"
          >
            Browse Campus Menus
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((ord) => {
            const dateStr = ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Order';

            return (
              <div
                key={ord._id || ord.orderId}
                className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#EA580C] px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200">
                      {ord.orderId}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {ord.restaurantId === 'rest-kfc'
                      ? 'KFC Campus Express'
                      : ord.restaurantId === 'rest-bk'
                      ? 'Burger King VIT'
                      : ord.restaurantId === 'rest-dominos'
                      ? "Domino's Pizza Hub"
                      : ord.restaurantId === 'rest-behrouz'
                      ? 'Behrouz Biryani'
                      : 'Campus Kitchen'}
                  </h3>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600">
                    {ord.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Delivered to: {ord.deliveryAddress?.street || 'Hostel Block D, Room 412'}
                    </span>
                  </div>
                </div>

                {/* Right: Price & CTA Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Total Pay
                    </span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">
                      ₹{ord.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(ord.orderId)}
                      className="btn-tactile px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReviewOrder(ord)}
                      className="btn-tactile px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1"
                      title="Rate your meal experience"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal for historical orders */}
      {selectedReviewOrder && (
        <ReviewModal
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          orderId={selectedReviewOrder.orderId}
          restaurantId={selectedReviewOrder.restaurantId}
          restaurantName={
            selectedReviewOrder.restaurantId === 'rest-kfc'
              ? 'KFC Campus Express'
              : selectedReviewOrder.restaurantId === 'rest-bk'
              ? 'Burger King VIT'
              : selectedReviewOrder.restaurantId === 'rest-dominos'
              ? "Domino's Pizza Hub"
              : 'Campus Kitchen'
          }
          onReviewSubmitted={() => {
            loadOrders();
          }}
        />
      )}
    </div>
  );
}
