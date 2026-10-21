import { Monitor } from '../models/Monitor.js';
import { CheckResult } from '../models/CheckResult.js';
import { getDatabaseStatus } from '../config/db.js';

const ensureDatabaseConnected = () => {
  const dbStatus = getDatabaseStatus();
  if (!dbStatus.isConnected) {
    const error = new Error(
      'Database unavailable. Please verify MongoDB is running and MONGODB_URI is properly configured.'
    );
    error.statusCode = 503;
    throw error;
  }
};

export const getMonitors = async (req, res, next) => {
  try {
    ensureDatabaseConnected();
    const monitors = await Monitor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: monitors.length,
      data: monitors,
    });
  } catch (error) {
    next(error);
  }
};

export const createMonitor = async (req, res, next) => {
  try {
    ensureDatabaseConnected();
    const { name, url, interval, checkIntervalSeconds, timeoutMs } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: { message: 'Monitor name and valid URL are required' },
      });
    }

    const monitor = await Monitor.create({
      name: name.trim(),
      url: url.trim(),
      checkIntervalSeconds: parseInt(checkIntervalSeconds || interval || 60, 10),
      timeoutMs: timeoutMs ? parseInt(timeoutMs, 10) : 10000,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    ensureDatabaseConnected();
    const monitors = await Monitor.find({ isActive: true });

    const totalMonitors = monitors.length;
    const operational = monitors.filter(
      (m) => m.status === 'up' || m.status === 'operational'
    ).length;
    const down = monitors.filter((m) => m.status === 'down').length;

    // Calculate latency from CheckResult collection without storing derived analytics on Monitor
    const recentChecks = await CheckResult.find({
      responseTimeMs: { $ne: null, $gt: 0 },
    })
      .sort({ checkedAt: -1 })
      .limit(100)
      .select('responseTimeMs');

    const avgResponseTime =
      recentChecks.length > 0
        ? Math.round(
            recentChecks.reduce((acc, c) => acc + c.responseTimeMs, 0) /
              recentChecks.length
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMonitors,
        operational,
        down,
        averageResponseTime: avgResponseTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMonitor = async (req, res, next) => {
  try {
    ensureDatabaseConnected();
    const { id } = req.params;
    const monitor = await Monitor.findByIdAndDelete(id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitor not found' },
      });
    }

    // Cascade delete associated check results and incidents
    await Promise.all([
      CheckResult.deleteMany({ monitor: id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Monitor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
