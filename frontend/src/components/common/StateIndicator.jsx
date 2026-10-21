import React from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './Button.jsx';

export const LoadingState = ({ message = 'Loading dashboard metrics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl glass-panel-subtle border border-dark-700/50">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  );
};

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An error occurred while fetching data from the API.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-rose-500/5 border border-rose-500/20">
      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
