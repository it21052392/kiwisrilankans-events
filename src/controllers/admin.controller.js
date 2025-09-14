import { asyncHandler } from '../utils/asyncHandler.js';
import { adminService } from '../services/admin.service.js';
import { logger } from '../config/logger.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;

  const users = await adminService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role,
    status,
  });

  res.json({
    success: true,
    data: users,
  });
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await adminService.getUserDetails(id);

  res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await adminService.updateUserRole(id, role);

  logger.info(`User role updated: ${user.email} - ${role}`);

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: { user },
  });
});

// @desc    Toggle user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await adminService.toggleUserStatus(id);

  logger.info(
    `User status toggled: ${user.email} - ${user.isActive ? 'Active' : 'Inactive'}`
  );

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user },
  });
});

// @desc    Get all events with admin details
// @route   GET /api/admin/events
// @access  Private/Admin
const getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    startDate,
    endDate,
  } = req.query;

  const events = await adminService.getAllEvents({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    category,
    status,
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: events,
  });
});

// @desc    Get event analytics
// @route   GET /api/admin/events/:id/analytics
// @access  Private/Admin
const getEventAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analytics = await adminService.getEventAnalytics(id);

  res.json({
    success: true,
    data: analytics,
  });
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, level, startDate, endDate } = req.query;

  const logs = await adminService.getSystemLogs({
    page: parseInt(page),
    limit: parseInt(limit),
    level,
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: logs,
  });
});

// @desc    Send bulk notification
// @route   POST /api/admin/notifications/bulk
// @access  Private/Admin
const sendBulkNotification = asyncHandler(async (req, res) => {
  const { title, message, type, targetUsers } = req.body;

  const result = await adminService.sendBulkNotification({
    title,
    message,
    type,
    targetUsers,
  });

  logger.info(`Bulk notification sent to ${result.sentCount} users`);

  res.json({
    success: true,
    message: `Notification sent to ${result.sentCount} users`,
    data: result,
  });
});

export {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  getAllEvents,
  getEventAnalytics,
  getSystemLogs,
  sendBulkNotification,
};
