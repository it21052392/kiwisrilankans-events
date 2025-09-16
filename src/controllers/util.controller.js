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

// @desc    Get public community stats
// @route   GET /api/utils/community-stats
// @access  Public
const getCommunityStats = asyncHandler(async (req, res) => {
  const { Event } = await import('../models/event.model.js');
  const { User } = await import('../models/user.model.js');
  const { Category } = await import('../models/category.model.js');

  const [eventStats, userStats, categoryStats] = await Promise.all([
    Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]),
    Category.aggregate([
      {
        $group: {
          _id: '$active',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalEvents = eventStats.reduce((sum, stat) => sum + stat.count, 0);
  const publishedEvents =
    eventStats.find(stat => stat._id === 'published')?.count || 0;

  const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
  const organizers =
    userStats.find(stat => stat._id === 'organizer')?.count || 0;

  const totalCategories = categoryStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );
  const activeCategories =
    categoryStats.find(stat => stat._id === true)?.count || 0;

  const communityStats = {
    events: {
      total: totalEvents,
      published: publishedEvents,
    },
    users: {
      total: totalUsers,
      organizers: organizers,
    },
    categories: {
      total: totalCategories,
      active: activeCategories,
    },
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: communityStats,
  });
});

export { getSystemInfo, getHealthCheck, getStats, getCommunityStats };
