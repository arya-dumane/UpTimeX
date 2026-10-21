import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export const SummaryCards = ({ summary = {}, isLoading = false }) => {
  const {
    totalMonitors = 0,
    operational = 0,
    down = 0,
    averageResponseTime = 0,
  } = summary;

  const cards = [
    {
      id: 'total',
      label: 'Total Monitors',
      value: totalMonitors,
      unit: '',
      icon: Activity,
      textColor: 'text-slate-100',
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/10',
      borderHover: 'hover:border-brand-500/40',
      description: 'Active monitored targets',
    },
    {
      id: 'operational',
      label: 'Operational',
      value: operational,
      unit: '',
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/40',
      description: totalMonitors > 0 ? `${Math.round((operational / totalMonitors) * 100)}% online` : 'No monitors configured',
    },
    {
      id: 'down',
      label: 'Down / Incidents',
      value: down,
      unit: '',
      icon: AlertTriangle,
      textColor: down > 0 ? 'text-rose-400' : 'text-slate-300',
      iconColor: down > 0 ? 'text-rose-400' : 'text-slate-400',
      iconBg: down > 0 ? 'bg-rose-500/10' : 'bg-slate-500/10',
      borderHover: down > 0 ? 'hover:border-rose-500/40' : 'hover:border-slate-600',
      description: down > 0 ? 'Requires attention' : 'Zero outages reported',
    },
    {
      id: 'response-time',
      label: 'Avg Response Time',
      value: averageResponseTime > 0 ? averageResponseTime : 0,
      unit: 'ms',
      icon: Zap,
      textColor: 'text-cyan-400',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      borderHover: 'hover:border-cyan-500/40',
      description: averageResponseTime > 0 ? 'Global latency aggregate' : 'No latency logged',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`glass-panel p-5 rounded-xl border border-dark-700/60 transition-all duration-200 ${card.borderHover}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              {isLoading ? (
                <div className="h-8 w-16 bg-dark-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs font-semibold text-slate-400">
                      {card.unit}
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
