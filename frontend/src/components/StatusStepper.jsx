import React from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ChefHat,
  Bike,
  PackageCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const STAGES = [
  {
    key: 'PENDING',
    title: 'Order Placed',
    subtitle: 'Saga transaction dispatched to Order Service',
    service: 'order-service (:5004)',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    title: 'Payment Authorized',
    subtitle: 'Payment Service processed order.created event',
    service: 'payment-service (:5005)',
    icon: CreditCard,
  },
  {
    key: 'PREPARING',
    title: 'Kitchen Accepted',
    subtitle: 'Kitchen preparing fresh meal & rider Ramesh assigned',
    service: 'delivery-service (:5006)',
    icon: ChefHat,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    title: 'On the Way',
    subtitle: 'Rider Ramesh en route to Hostel Block D, VIT Vellore',
    service: 'delivery-service (:5006)',
    icon: Bike,
  },
  {
    key: 'DELIVERED',
    title: 'Order Delivered',
    subtitle: 'Package arrived at Hostel Block D security desk',
    service: 'delivery-service (:5006)',
    icon: PackageCheck,
  },
];

export default function StatusStepper({ currentStage, isCancelled }) {
  // Determine numerical stage index (0 to 4)
  const getStageIndex = (stage) => {
    switch (stage) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
      case 'ASSIGNED':
      case 'PICKED_UP':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <span className="font-bold block">Order Cancelled</span>
          <span>Payment failed or transaction was rolled back by the Saga coordinator.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Choreography Lifecycle
          </h4>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            RabbitMQ Event-Driven State Machine
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Stage {activeIndex + 1} of 5</span>
        </div>
      </div>

      {/* Stepper Vertical on Mobile, Horizontal on Desktop */}
      <div className="relative">
        <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
          {STAGES.map((stage, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const isUpcoming = index > activeIndex;
            const Icon = stage.icon;

            return (
              <li
                key={stage.key}
                className="relative flex md:flex-col items-start gap-3 md:gap-2.5 group"
              >
                {/* Connecting Track Line for Desktop */}
                {index < STAGES.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-5 left-1/2 w-full h-0.5 -z-0 transition-colors duration-500 ${
                      index < activeIndex ? 'bg-emerald-500' : 'bg-stone-200'
                    }`}
                  />
                )}

                {/* Stage Badge Node */}
                <div className="relative z-10 shrink-0">
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all">
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                  ) : isActive ? (
                    <div className="w-10 h-10 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20 transition-all">
                      <Icon className="w-5 h-5 animate-pulse" strokeWidth={2} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 text-slate-400 flex items-center justify-center transition-all">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1 md:text-center md:pt-1">
                  <div className="flex items-center gap-1.5 md:justify-center">
                    <span
                      className={`text-xs font-extrabold truncate ${
                        isActive
                          ? 'text-[#EA580C]'
                          : isCompleted
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.title}
                    </span>
                    {isActive && (
                      <span className="md:hidden inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-800">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2 md:line-clamp-3">
                    {stage.subtitle}
                  </p>

                  <div className="mt-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block ${
                        isActive
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-50 text-slate-400 border-stone-200'
                      }`}
                    >
                      {stage.service}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
