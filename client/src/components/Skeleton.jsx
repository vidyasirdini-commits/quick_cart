import React from 'react';

export const Skeleton = ({
  variant = 'text',
  className = '',
  count = 1,
  width,
  height,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl w-full h-32',
    card: 'rounded-xl w-full h-48',
  };

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  if (count > 1) {
    return (
      <div className="space-y-2.5 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
            style={style}
            aria-hidden="true"
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <Skeleton variant="rectangular" className="h-40 rounded-lg" />
      <Skeleton variant="text" className="w-3/4 h-5" />
      <Skeleton variant="text" className="w-1/2 h-4" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="w-16 h-6" />
        <Skeleton variant="text" className="w-24 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-6 py-4">
          <Skeleton variant="text" className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
