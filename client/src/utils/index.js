// Order status mapping colors and labels
export const ORDER_STATUS_CONFIG = {
  placed: {
    label: 'Order Placed',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
    step: 1,
  },
  accepted: {
    label: 'Accepted by Store',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    step: 2,
  },
  packed: {
    label: 'Order Packed',
    color: 'bg-amber-100 text-amber-900 border-amber-400',
    dot: 'bg-amber-600',
    step: 3,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
    step: 4,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    step: 5,
  },
  rejected: {
    label: 'Rejected by Store',
    color: 'bg-red-100 text-red-800 border-red-300',
    dot: 'bg-red-500',
    step: 0,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-300',
    dot: 'bg-red-500',
    step: 0,
  },
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
