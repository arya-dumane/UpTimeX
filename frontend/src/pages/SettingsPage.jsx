import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { healthService } from '../services/healthService.js';
import { Server, Database, Bell, Shield, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthService
      .checkHealth()
      .then((data) => setHealthData(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          System Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure UptimeX engine parameters, infrastructure status, and notification rules
        </p>
      </div>

      {/* Backend & Database Connection Diagnostics */}
      <Card
        title="Infrastructure Health Diagnostics"
        subtitle="Current status of the backend API and database connection"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API Server */}
          <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-400" /> API Server
              </span>
              <Badge variant={healthData?.status === 'healthy' ? 'operational' : 'degraded'}>
                {healthData?.status || 'Unknown'}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Version:</span>
                <span className="text-slate-200 font-mono">{healthData?.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Environment:</span>
                <span className="text-slate-200 font-mono capitalize">{healthData?.environment || 'development'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Uptime:</span>
                <span className="text-slate-200 font-mono">{healthData?.uptimeSeconds ? `${healthData.uptimeSeconds}s` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> MongoDB Store
              </span>
              <Badge variant={healthData?.database?.connected ? 'operational' : 'down'}>
                {healthData?.database?.status || 'Disconnected'}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Host:</span>
                <span className="text-slate-200 font-mono">{healthData?.database?.host || 'None'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Database:</span>
                <span className="text-slate-200 font-mono">{healthData?.database?.databaseName || 'uptimex'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ready State:</span>
                <span className="text-slate-200 font-mono capitalize">{healthData?.database?.readyState || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Alert Notification Channels Preview */}
      <Card
        title="Notification Channels (Phase 2 Preview)"
        subtitle="Configurable alert destinations when endpoints fail ping checks"
      >
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-dark-900/40 border border-dark-700/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-200">Email Alerts</h4>
                <p className="text-xs text-slate-500">Send notifications on downtime status changes</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-dark-800 px-2.5 py-1 rounded-md border border-dark-700">
              Planned (Phase 2)
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-900/40 border border-dark-700/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-200">Webhook & Slack</h4>
                <p className="text-xs text-slate-500">Trigger custom webhook endpoints and Slack channels</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-dark-800 px-2.5 py-1 rounded-md border border-dark-700">
              Planned (Phase 2)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
