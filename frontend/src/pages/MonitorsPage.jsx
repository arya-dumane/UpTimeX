import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonitorsTable } from '../components/dashboard/MonitorsTable.jsx';
import { EmptyMonitorsState } from '../components/dashboard/EmptyMonitorsState.jsx';
import { LoadingState, ErrorState } from '../components/common/StateIndicator.jsx';
import { Button } from '../components/common/Button.jsx';
import { monitorService } from '../services/monitorService.js';
import { Search, Plus, Filter } from 'lucide-react';

export const MonitorsPage = () => {
  const { openAddModal, refreshTrigger, triggerRefresh } = useOutletContext();
  const [monitors, setMonitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMonitors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await monitorService.getMonitors();
      setMonitors(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load monitors.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors, refreshTrigger]);

  const filteredMonitors = monitors.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || m.status?.toLowerCase() === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (isLoading && monitors.length === 0) {
    return (
      <div className="py-12">
        <LoadingState message="Fetching active monitors..." />
      </div>
    );
  }

  if (error && monitors.length === 0) {
    return (
      <div className="py-12">
        <ErrorState
          title="Monitors Unavailable"
          message={error}
          onRetry={fetchMonitors}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Monitors
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage all configured website and API endpoints
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
        >
          Add Monitor
        </Button>
      </div>

      {monitors.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search monitors by name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-dark-900/80 border border-dark-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-dark-900/80 p-1 rounded-lg border border-dark-700/80 text-xs">
            {['all', 'operational', 'down', 'pending'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === filter
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {monitors.length === 0 ? (
        <EmptyMonitorsState onAddClick={openAddModal} />
      ) : filteredMonitors.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-xl border border-dark-700/60">
          <p className="text-sm text-slate-400">
            No monitors match the filter criteria "{searchQuery || statusFilter}".
          </p>
        </div>
      ) : (
        <MonitorsTable
          monitors={filteredMonitors}
          onMonitorDeleted={() => {
            fetchMonitors();
            triggerRefresh();
          }}
          onAddClick={openAddModal}
        />
      )}
    </div>
  );
};
