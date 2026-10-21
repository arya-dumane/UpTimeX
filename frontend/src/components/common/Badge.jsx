import React from 'react';

const variantStyles = {
  operational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/20',
  up: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/20',
  down: 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-rose-500/20',
  degraded: 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/20',
  pending: 'bg-slate-500/10 text-slate-300 border-slate-500/20 ring-slate-500/20',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 ring-cyan-500/20',
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20 ring-brand-500/20',
};

const dotColors = {
  operational: 'bg-emerald-400',
  up: 'bg-emerald-400',
  down: 'bg-rose-400',
  degraded: 'bg-amber-400',
  pending: 'bg-slate-400',
  info: 'bg-cyan-400',
  brand: 'bg-brand-400',
};

export const Badge = ({
  children,
  variant = 'pending',
  showDot = true,
  pulse = false,
  className = '',
}) => {
  const normalizedVariant = variant?.toLowerCase() || 'pending';
  const badgeStyle = variantStyles[normalizedVariant] || variantStyles.pending;
  const dotColor = dotColors[normalizedVariant] || dotColors.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
            pulse ? 'animate-pulse-dot' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
};
