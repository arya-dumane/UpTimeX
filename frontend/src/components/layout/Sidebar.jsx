import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Settings,
  Radio,
  Server,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { healthService } from '../../services/healthService.js';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Monitors', path: '/monitors', icon: Radio },
  { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState({ status: 'checking', dbStatus: 'unknown' });

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const res = await healthService.checkHealth();
        if (isMounted) {
          setHealth({
            status: res.data?.status || 'ok',
            dbStatus: res.data?.database?.status || 'unknown',
          });
        }
      } catch (err) {
        if (isMounted) {
          setHealth({ status: 'offline', dbStatus: 'disconnected' });
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-700/60 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-dark-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-glow-primary">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  Uptime<span className="text-brand-500">X</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  SaaS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Monitoring
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* API & Backend Status Card in Sidebar Footer */}
        <div className="p-4 border-t border-dark-700/60">
          <div className="p-3 rounded-lg bg-dark-950/70 border border-dark-700/50 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" /> API Node
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  health.status === 'healthy'
                    ? 'text-emerald-400'
                    : health.status === 'degraded'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {health.status === 'healthy' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {health.status === 'healthy'
                  ? 'Healthy'
                  : health.status === 'degraded'
                  ? 'Degraded'
                  : 'Offline'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Database</span>
              <span className="text-slate-300 font-mono capitalize">
                {health.dbStatus}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
