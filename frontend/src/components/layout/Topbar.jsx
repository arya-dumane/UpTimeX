import React from 'react';
import { Menu, Plus, RefreshCw, Bell } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const Topbar = ({ onMenuClick, onAddMonitorClick, onRefresh, isRefreshing }) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-dark-700/60 bg-dark-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight">
            System Dashboard
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Real-time infrastructure health and website uptime
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-800 transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`}
            />
          </button>
        )}

        {onAddMonitorClick && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onAddMonitorClick}
          >
            Add Monitor
          </Button>
        )}
      </div>
    </header>
  );
};
