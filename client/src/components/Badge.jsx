import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  status,
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  // If status is supplied, map directly to status color specification
  const statusStyles = {
    placed: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
      label: 'Placed',
    },
    accepted: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Accepted',
    },
    packed: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      dot: 'bg-amber-600',
      label: 'Packed',
    },
    out_for_delivery: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
      label: 'Out for Delivery',
    },
    delivered: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
      label: 'Delivered',
    },
    rejected: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Rejected',
    },
    cancelled: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Cancelled',
    },
  };

  const generalVariants = {
    default: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
    },
    primary: {
      badge: 'bg-primary-50 text-primary-700 border-primary-200',
      dot: 'bg-primary-500',
    },
    accent: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    success: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    danger: {
      badge: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
    info: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
  };

  const selected = status ? statusStyles[status] || statusStyles.placed : generalVariants[variant] || generalVariants.default;

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const displayContent = children || (status ? statusStyles[status]?.label : '');

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${selected.badge} ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      {...props}
    >
      {(dot || status) && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${selected.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayContent}</span>
    </span>
  );
};

export default Badge;
