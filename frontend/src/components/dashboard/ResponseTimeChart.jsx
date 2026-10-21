import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { Card } from '../common/Card.jsx';

export const ResponseTimeChart = ({ monitors = [], historyData = null }) => {
  const [timeRange, setTimeRange] = useState('24h');

  // If real historical data is provided, use it. Otherwise, if monitors have responseTime, format them, or show empty state
  const hasMonitors = monitors.length > 0;
  const hasLatencyData = monitors.some((m) => m.responseTime > 0) || (historyData && historyData.length > 0);

  // Custom tooltip component for dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900/95 border border-dark-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-semibold text-slate-100">
              {payload[0].value} ms
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Response Time Trends"
      subtitle="Average HTTP latency recorded across all active monitors"
      action={
        <div className="flex items-center gap-1 bg-dark-900/80 p-0.5 rounded-lg border border-dark-700/60 text-xs">
          {['1h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeRange === range
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-64 w-full">
        {!hasMonitors || !hasLatencyData ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 rounded-lg border border-dashed border-dark-700/60 bg-dark-900/30">
            <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-slate-400 mb-2.5">
              <Clock className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              No Latency Metrics Recorded Yet
            </p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Response time metrics will populate here once active uptime checks are initiated by the monitoring worker.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historyData || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e2c4d"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#1e2c4d' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
