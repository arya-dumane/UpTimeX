import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SummaryCards } from '../components/dashboard/SummaryCards.jsx';
import { ResponseTimeChart } from '../components/dashboard/ResponseTimeChart.jsx';
import { MonitorsTable } from '../components/dashboard/MonitorsTable.jsx';
import { EmptyMonitorsState } from '../components/dashboard/EmptyMonitorsState.jsx';
import { LoadingState, ErrorState } from '../components/common/StateIndicator.jsx';
import { monitorService } from '../services/monitorService.js';
import { healthService } from '../services/healthService.js';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export const OverviewPage = () => {
  const { openAddModal, refreshTrigger, triggerRefresh } = useOutletContext();

  const [monitors, setMonitors] = useState([]);
  const [summary, setSummary] = useState({
    totalMonitors: 0,
    operational: 0,
    down: 0,
    averageResponseTime: 0,
  });
  const [healthInfo, setHealthInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch health status
      const healthData = await healthService.checkHealth().catch(() => null);
      setHealthInfo(healthData);

      // Fetch monitors and summary
      const [monitorsData, summaryData] = await Promise.all([
        monitorService.getMonitors(),
        monitorService.getDashboardSummary(),
      ]);

      setMonitors(monitorsData || []);
      setSummary(summaryData || {
        totalMonitors: monitorsData.length,
        operational: monitorsData.filter((m) => m.status === 'operational').length,
        down: monitorsData.filter((m) => m.status === 'down').length,
        averageResponseTime: 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.message || 'Unable to connect to UptimeX API. Please verify backend server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleMonitorDeleted = (id) => {
    setMonitors((prev) => prev.filter((m) => m._id !== id));
    triggerRefresh();
  };

  if (isLoading && monitors.length === 0) {
    return (
      <div className="py-12">
        <LoadingState message="Connecting to UptimeX API and fetching telemetry..." />
      </div>
    );
  }

  if (error && monitors.length === 0) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not connect to backend"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const isDbDegraded = healthInfo && healthInfo.database?.connected === false;

  return (
    <div className="space-y-6">
      {/* Degraded database warning notice if applicable */}
      {isDbDegraded && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-amber-200">
              Database Disconnected (Degraded Mode)
            </h4>
            <p className="text-xs text-amber-300/80 mt-0.5">
              MongoDB is currently unreachable. Start MongoDB locally or configure a valid MONGODB_URI in your backend .env file to enable persistence.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* If no monitors exist, show explicit empty state or guidance */}
      {monitors.length === 0 ? (
        <EmptyMonitorsState onAddClick={openAddModal} />
      ) : (
        <>
          {/* Uptime and Latency Chart Area */}
          <ResponseTimeChart monitors={monitors} />

          {/* Monitored Websites Table */}
          <MonitorsTable
            monitors={monitors}
            onMonitorDeleted={handleMonitorDeleted}
            onAddClick={openAddModal}
          />
        </>
      )}
    </div>
  );
};
