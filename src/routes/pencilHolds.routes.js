import express from 'express';
import {
  getPencilHolds,
  getPencilHoldById,
  createPencilHold,
  updatePencilHold,
  deletePencilHold,
  getMyPencilHolds,
  confirmPencilHold,
  cancelPencilHold,
} from '../controllers/pencilHolds.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { pencilHoldSchemas } from '../validators/pencilHolds.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(commonSchemas.pagination), getPencilHolds);
router.get('/:id', validateParams(commonSchemas.mongoId), getPencilHoldById);

// Protected routes
router.use(authenticate);

// User pencil hold management
router.post('/', validateBody(pencilHoldSchemas.create), createPencilHold);
router.put(
  '/:id',
  validateParams(commonSchemas.mongoId),
  validateBody(pencilHoldSchemas.update),
  updatePencilHold
);
router.delete('/:id', validateParams(commonSchemas.mongoId), deletePencilHold);
router.get(
  '/my-holds',
  validateQuery(commonSchemas.pagination),
  getMyPencilHolds
);

// Admin only routes
router.use(requireAdmin);

router.patch(
  '/:id/confirm',
  validateParams(commonSchemas.mongoId),
  confirmPencilHold
);
router.patch(
  '/:id/cancel',
  validateParams(commonSchemas.mongoId),
  validateBody(pencilHoldSchemas.cancel),
  cancelPencilHold
);

export default router;
