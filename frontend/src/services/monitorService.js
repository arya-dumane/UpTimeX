import api from './api.js';

export const monitorService = {
  getMonitors: async () => {
    const response = await api.get('/monitors');
    return response.data || [];
  },

  getDashboardSummary: async () => {
    const response = await api.get('/monitors/summary');
    return response.data;
  },

  createMonitor: async (monitorData) => {
    const response = await api.post('/monitors', monitorData);
    return response.data;
  },

  deleteMonitor: async (id) => {
    const response = await api.delete(`/monitors/${id}`);
    return response;
  },
};
