import React from 'react';
import { Zap, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    title: 'UPI / Google Pay',
    subtitle: 'Instant authorization via UPI QR or VPA',
    badge: 'Fastest',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'CARD',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay & Corporate cards',
    badge: 'Secure',
    icon: CreditCard,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'COD',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash or UPI to rider Ramesh upon arrival',
    badge: 'Doorstep',
    icon: Banknote,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

export default function PaymentSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Payment Method
        </label>
        <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Saga Choreography Protected
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm ring-1 ring-orange-500/30'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70'
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-stone-100 text-slate-700 border-stone-200'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-slate-900' : 'text-slate-800'
                      }`}
                    >
                      {method.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                        isSelected
                          ? 'bg-orange-200/80 text-orange-900'
                          : 'bg-stone-100 text-slate-600'
                      }`}
                    >
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {method.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                {isSelected ? (
                  <CheckCircle2
                    className="w-5 h-5 text-orange-600 fill-orange-100"
                    strokeWidth={1.75}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-stone-300 bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
