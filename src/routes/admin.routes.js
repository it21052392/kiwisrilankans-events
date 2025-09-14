import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  getAllEvents,
  getEventAnalytics,
  getSystemLogs,
  sendBulkNotification,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { adminSchemas } from '../validators/admin.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', validateQuery(commonSchemas.pagination), getAllUsers);
router.get('/users/:id', validateParams(commonSchemas.mongoId), getUserDetails);
router.put(
  '/users/:id/role',
  validateParams(commonSchemas.mongoId),
  validateBody(adminSchemas.updateRole),
  updateUserRole
);
router.patch(
  '/users/:id/status',
  validateParams(commonSchemas.mongoId),
  toggleUserStatus
);

// Event management
router.get('/events', validateQuery(commonSchemas.pagination), getAllEvents);
router.get(
  '/events/:id/analytics',
  validateParams(commonSchemas.mongoId),
  getEventAnalytics
);

// System management
router.get('/logs', validateQuery(adminSchemas.getLogs), getSystemLogs);

// Notifications
router.post(
  '/notifications/bulk',
  validateBody(adminSchemas.bulkNotification),
  sendBulkNotification
);

export default router;
