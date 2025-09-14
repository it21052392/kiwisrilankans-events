import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
} from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { userSchemas } from '../validators/user.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get(
  '/',
  requireAdmin,
  validateQuery(commonSchemas.pagination),
  getUsers
);
router.get(
  '/:id',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  getUserById
);
router.put(
  '/:id',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  validateBody(userSchemas.update),
  updateUser
);
router.delete(
  '/:id',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  deleteUser
);

// User profile routes
router.put('/profile', validateBody(userSchemas.updateProfile), updateProfile);
router.put(
  '/change-password',
  validateBody(userSchemas.changePassword),
  changePassword
);

export default router;
