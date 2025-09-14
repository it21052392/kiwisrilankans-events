import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '../controllers/categories.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { categorySchemas } from '../validators/categories.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(commonSchemas.pagination), getCategories);
router.get('/:id', validateParams(commonSchemas.mongoId), getCategoryById);

// Admin only routes
router.use(authenticate);
router.use(requireAdmin);

router.post('/', validateBody(categorySchemas.create), createCategory);
router.put(
  '/:id',
  validateParams(commonSchemas.mongoId),
  validateBody(categorySchemas.update),
  updateCategory
);
router.delete('/:id', validateParams(commonSchemas.mongoId), deleteCategory);
router.patch(
  '/:id/toggle',
  validateParams(commonSchemas.mongoId),
  toggleCategoryStatus
);

export default router;
