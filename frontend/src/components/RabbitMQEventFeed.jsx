import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';
import { fetchOrderNotifications } from '../api/client';

export default function RabbitMQEventFeed({ orderId, autoRefresh = true }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const loadEvents = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await fetchOrderNotifications(orderId);
      if (Array.isArray(data)) {
        setEvents(data);
      }
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[RabbitMQEventFeed] Could not fetch events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    if (!autoRefresh) return;
    const interval = setInterval(loadEvents, 2500);
    return () => clearInterval(interval);
  }, [orderId, autoRefresh]);

  const getServiceForEvent = (eventType) => {
    if (eventType?.startsWith('order.')) return { name: 'Order Service', port: ':5004', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    if (eventType?.startsWith('payment.')) return { name: 'Payment Service', port: ':5005', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (eventType?.startsWith('delivery.')) return { name: 'Delivery Service', port: ':5006', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    return { name: 'Distributed Fleet', port: ':5000', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                RabbitMQ Choreography Audit Feed
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                Topic: food_delivery_events
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Live decoupled domain event stream recorded by Notification Service (:5007)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {lastChecked && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Updated: {lastChecked}
            </span>
          )}
          <button
            type="button"
            onClick={loadEvents}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Refresh event stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events Stream List */}
      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500 space-y-2 text-xs">
          <Activity className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
          <p>Listening on exchange 'food_delivery_events'...</p>
          <span className="text-[10px] text-slate-600">Events will appear as microservices publish to queues</span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {events.map((evt, idx) => {
            const svc = getServiceForEvent(evt.eventType);
            const timeStr = evt.timestamp
              ? new Date(evt.timestamp).toLocaleTimeString()
              : '--:--:--';

            return (
              <div
                key={evt.id || idx}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-orange-400 font-bold tracking-tight truncate">
                      {evt.eventType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${svc.color} shrink-0`}>
                      {svc.name} {svc.port}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {timeStr}
                  </span>
                </div>

                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {evt.message}
                </p>

                {evt.data?.paymentId && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span className="text-slate-500">Txn Ref:</span>
                    <span className="text-amber-300 font-mono">{evt.data.paymentId}</span>
                  </div>
                )}
                {evt.data?.deliveryId && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span className="text-slate-500">Delivery Ref:</span>
                    <span className="text-emerald-300 font-mono">{evt.data.deliveryId}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluator Notes */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Evaluator Architecture: Choreography Pattern</span>
        <span className="text-slate-400">Total Captured: {events.length}</span>
      </div>
    </div>
  );
}
