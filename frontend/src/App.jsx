import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { MonitorsPage } from './pages/MonitorsPage.jsx';
import { IncidentsPage } from './pages/IncidentsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="monitors" element={<MonitorsPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
