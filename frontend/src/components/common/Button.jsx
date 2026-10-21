import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-primary border border-brand-500/30',
  secondary:
    'bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700/60',
  outline:
    'bg-transparent hover:bg-dark-800 text-slate-300 hover:text-white border border-slate-700',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose border border-rose-500/30',
  ghost:
    'bg-transparent hover:bg-dark-800/80 text-slate-400 hover:text-slate-100',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md font-medium',
  md: 'px-4 py-2 text-sm rounded-lg font-medium',
  lg: 'px-5 py-2.5 text-base rounded-lg font-semibold',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
      )}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
};
