import React from 'react';
import { Check, Clock, PackageCheck, Truck, Home, XCircle } from 'lucide-react';
import { formatDate } from '../utils';

export const Stepper = ({ currentStatus = 'placed', history = [], className = '' }) => {
  const steps = [
    { key: 'placed', label: 'Placed', icon: Clock, description: 'Order submitted' },
    { key: 'accepted', label: 'Accepted', icon: Check, description: 'Confirmed by store' },
    { key: 'packed', label: 'Packed', icon: PackageCheck, description: 'Bagged & ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'On the way' },
    { key: 'delivered', label: 'Delivered', icon: Home, description: 'Arrived at your door' },
  ];

  const isRejected = currentStatus === 'rejected';
  const isCancelled = currentStatus === 'cancelled';
  const isFailed = isRejected || isCancelled;

  // Determine current step index in standard flow
  const currentStepIndex = steps.findIndex((s) => s.key === currentStatus);

  // Map timestamp from history if available
  const getHistoryItem = (statusKey) => {
    return history.find((h) => h.status === statusKey);
  };

  if (isFailed) {
    const failedItem = history.find((h) => h.status === currentStatus);
    return (
      <div className={`p-6 rounded-2xl bg-danger-50 border border-danger-200 text-center ${className}`}>
        <div className="inline-flex p-3 rounded-full bg-danger-100 text-danger-600 mb-3">
          <XCircle className="h-8 w-8" />
        </div>
        <h4 className="text-lg font-bold text-danger-900 capitalize">
          Order {currentStatus}
        </h4>
        <p className="text-sm text-danger-700 mt-1 max-w-md mx-auto">
          {isRejected
            ? 'The store partner was unable to fulfill this order.'
            : 'This order was cancelled by the customer.'}
        </p>
        {failedItem?.changed_at && (
          <p className="text-xs text-danger-500 mt-2">
            Updated at {formatDate(failedItem.changed_at)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full py-4 ${className}`}>
      {/* Mobile view (Vertical timeline) */}
      <div className="block sm:hidden">
        <ol className="relative border-l-2 border-slate-200 ml-4 space-y-6" role="list">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            const historyEntry = getHistoryItem(step.key);

            let circleClass = 'bg-slate-100 border-2 border-slate-300 text-slate-400';
            if (isCompleted) {
              circleClass = 'bg-primary-600 border-2 border-primary-600 text-white';
            } else if (isCurrent) {
              circleClass = 'bg-accent-500 border-4 border-accent-100 text-white animate-pulse';
            }

            return (
              <li
                key={step.key}
                className="ml-6"
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ${circleClass}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </span>
                <div className="flex flex-col">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-accent-600'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  {historyEntry?.changed_at && (
                    <span className="text-[11px] text-slate-400 mt-1">
                      {formatDate(historyEntry.changed_at)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop & Tablet view (Horizontal timeline) */}
      <div className="hidden sm:block">
        <ol className="flex items-center w-full justify-between relative" role="list">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            const historyEntry = getHistoryItem(step.key);

            let circleClass = 'bg-white border-2 border-slate-300 text-slate-400';
            if (isCompleted) {
              circleClass = 'bg-primary-600 border-2 border-primary-600 text-white';
            } else if (isCurrent) {
              circleClass = 'bg-accent-500 border-4 border-amber-200 text-white shadow-md shadow-amber-500/30';
            }

            return (
              <li
                key={step.key}
                className="relative flex flex-col items-center flex-1 text-center"
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Connecting Line */}
                {idx > 0 && (
                  <div
                    className={`absolute top-5 -left-1/2 w-full h-0.5 -z-0 transition-colors ${
                      currentStepIndex >= idx ? 'bg-primary-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-transform duration-200 ${circleClass}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="mt-3 space-y-0.5">
                  <h4
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-accent-600'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-500">{step.description}</p>
                  {historyEntry?.changed_at && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatDate(historyEntry.changed_at)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default Stepper;
