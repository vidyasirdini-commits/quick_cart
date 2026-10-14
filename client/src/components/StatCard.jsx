import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last week',
  subtitle,
  variant = 'default',
  className = '',
}) => {
  const iconVariants = {
    default: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    info: 'bg-info-50 text-info-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  const isPositive = typeof trend === 'number' && trend > 0;
  const isNegative = typeof trend === 'number' && trend < 0;
  const isNeutral = typeof trend === 'number' && trend === 0;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              iconVariants[variant] || iconVariants.default
            }`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs pt-3 border-t border-slate-100">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center font-semibold rounded-md px-1.5 py-0.5 ${
                isPositive
                  ? 'text-emerald-700 bg-emerald-50'
                  : isNegative
                  ? 'text-danger-700 bg-danger-50'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isPositive && <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
              {isNegative && <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
              {isNeutral && <Minus className="h-3.5 w-3.5 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
