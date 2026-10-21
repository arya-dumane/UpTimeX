import React from 'react';
import { Radio, Plus, ShieldCheck, Zap, Bell } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const EmptyMonitorsState = ({ onAddClick }) => {
  return (
    <div className="glass-panel rounded-2xl border border-dark-700/60 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center shadow-glow-primary mb-5">
        <Radio className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-100 tracking-tight">
        No Monitored Websites Yet
      </h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
        Start tracking the uptime and performance of your APIs, web applications, and services. We will ping your endpoints regularly and record latency.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto my-6 text-left">
        <div className="p-3.5 rounded-lg bg-dark-900/60 border border-dark-700/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
          <h4 className="text-xs font-semibold text-slate-200">HTTP / HTTPS Checks</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Continuous health verification</p>
        </div>
        <div className="p-3.5 rounded-lg bg-dark-900/60 border border-dark-700/40">
          <Zap className="w-4 h-4 text-cyan-400 mb-1.5" />
          <h4 className="text-xs font-semibold text-slate-200">Latency Tracking</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Precise response time metrics</p>
        </div>
        <div className="p-3.5 rounded-lg bg-dark-900/60 border border-dark-700/40">
          <Bell className="w-4 h-4 text-amber-400 mb-1.5" />
          <h4 className="text-xs font-semibold text-slate-200">Incident Alerts</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Instant outage notifications</p>
        </div>
      </div>

      {onAddClick && (
        <Button
          size="lg"
          variant="primary"
          icon={Plus}
          onClick={onAddClick}
          className="shadow-glow-primary"
        >
          Add Your First Monitor
        </Button>
      )}
    </div>
  );
};
