import React, { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { monitorService } from '../../services/monitorService.js';

export const MonitorsTable = ({
  monitors = [],
  onMonitorDeleted,
  onAddClick,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await monitorService.deleteMonitor(id);
      if (onMonitorDeleted) {
        onMonitorDeleted(id);
      }
    } catch (err) {
      alert(`Failed to delete monitor: ${err.message || 'Error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatLastChecked = (dateString) => {
    if (!dateString) return 'Pending check';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="glass-panel rounded-xl border border-dark-700/60 overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-dark-700/60 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Monitored Websites
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status checks and latency across all endpoints
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
          {monitors.length} {monitors.length === 1 ? 'Service' : 'Services'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-dark-700/60 bg-dark-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th className="py-3 px-5">Target</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Uptime (24h)</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4">Interval</th>
              <th className="py-3 px-4">Last Checked</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/40">
            {monitors.map((m) => {
              const isDeleting = deletingId === m._id;
              return (
                <tr
                  key={m._id}
                  className="hover:bg-dark-800/40 transition-colors group"
                >
                  {/* Name and URL */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">
                        {m.name}
                      </span>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 mt-0.5 transition-colors"
                      >
                        <span className="truncate max-w-[200px] sm:max-w-xs">{m.url}</span>
                        <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={m.status || 'pending'}
                      pulse={m.status === 'operational'}
                    >
                      <span className="capitalize">{m.status || 'pending'}</span>
                    </Badge>
                  </td>

                  {/* Uptime % */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {m.uptimePercentage !== undefined
                          ? `${m.uptimePercentage.toFixed(2)}%`
                          : '100%'}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-dark-800 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            (m.uptimePercentage || 100) > 98
                              ? 'bg-emerald-500'
                              : (m.uptimePercentage || 100) > 90
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${m.uptimePercentage || 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Latency / Response Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-cyan-400 font-medium">
                      {m.responseTime > 0 ? `${m.responseTime} ms` : '—'}
                    </span>
                  </td>

                  {/* Interval */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-xs text-slate-400">
                      Every {m.checkIntervalSeconds || m.interval || 60}s
                    </span>
                  </td>

                  {/* Last Checked */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatLastChecked(m.lastCheckedAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(m._id, m.name)}
                      disabled={isDeleting}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Monitor"
                      aria-label="Delete Monitor"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
