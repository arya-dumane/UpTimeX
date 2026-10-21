import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { AddMonitorModal } from '../dashboard/AddMonitorModal.jsx';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMonitorAdded = () => {
    setIsAddModalOpen(false);
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddMonitorClick={() => setIsAddModalOpen(true)}
          onRefresh={handleRefresh}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              openAddModal: () => setIsAddModalOpen(true),
              refreshTrigger,
              triggerRefresh: handleRefresh,
            }}
          />
        </main>
      </div>

      <AddMonitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMonitorAdded}
      />
    </div>
  );
};
