import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { monitorService } from '../services/monitorService.js';
import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingState } from '../components/common/StateIndicator.jsx';

export const IncidentsPage = () => {
  const { refreshTrigger } = useOutletContext();
  const [monitors, setMonitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMonitors = async () => {
      setIsLoading(true);
      try {
        const data = await monitorService.getMonitors();
        if (isMounted) {
          setMonitors(data || []);
        }
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMonitors();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const downMonitors = monitors.filter((m) => m.status === 'down');

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Checking incident logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Incidents & Outages
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time incident detection and historical service disruption tracking
        </p>
      </div>

      {downMonitors.length > 0 ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="text-sm">
              <span className="font-semibold text-rose-200">
                {downMonitors.length} active service outage detected
              </span>
              <p className="text-xs text-rose-300/80 mt-0.5">
                The monitoring engine has identified downtime on the endpoints listed below.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-dark-700/60 overflow-hidden divide-y divide-dark-700/40">
            {downMonitors.map((m) => (
              <div key={m._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="down" pulse>
                      Outage
                    </Badge>
                    <span className="font-semibold text-slate-100">{m.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{m.url}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Last checked: {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleTimeString() : 'Pending'}</span>
                  </div>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-dark-700/60 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-emerald mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            All Systems Operating Normally
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5">
            Zero active incidents or outages currently reported across your monitored endpoints.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-dark-700/80 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            Incident monitoring active
          </div>
        </div>
      )}
    </div>
  );
};
