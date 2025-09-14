import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get system information
// @route   GET /api/utils/system
// @access  Private/Admin
const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: systemInfo,
  });
});

// @desc    Get health check
// @route   GET /api/utils/health
// @access  Public
const getHealthCheck = asyncHandler(async (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  res.json({
    success: true,
    data: healthData,
  });
});

// @desc    Get basic stats
// @route   GET /api/utils/stats
// @access  Public
const getStats = asyncHandler(async (req, res) => {
  const stats = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    },
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: stats,
  });
});

export { getSystemInfo, getHealthCheck, getStats };
