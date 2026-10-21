import { getDatabaseStatus } from '../config/db.js';
import { env } from '../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.isConnected;

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'uptimex-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: {
      status: dbStatus.status,
      connected: dbStatus.isConnected,
      databaseName: dbStatus.databaseName,
      readyState: dbStatus.readyState,
      ...(dbStatus.lastError && { error: dbStatus.lastError }),
    },
  };

  // HTTP 200 with degraded diagnosis payload when database is offline
  res.status(200).json({
    success: true,
    data: healthData,
  });
};
