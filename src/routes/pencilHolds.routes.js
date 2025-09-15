import express from 'express';
import {
  getPencilHolds,
  getPencilHoldById,
  createPencilHold,
  updatePencilHold,
  deletePencilHold,
  getMyPencilHolds,
  confirmPencilHold,
  approvePencilHold,
  cancelPencilHold,
} from '../controllers/pencilHolds.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin, requireAdminOrOrganizer } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { pencilHoldSchemas } from '../validators/pencilHolds.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Protected routes - Organizers only
router.use(authenticate);
router.use(requireAdminOrOrganizer);

// Organizer pencil hold management
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

// Admin routes for viewing all pencil holds
router.get('/', validateQuery(commonSchemas.pagination), getPencilHolds);
router.get('/:id', validateParams(commonSchemas.mongoId), getPencilHoldById);

// Organizer confirmation route (moved up)
router.patch(
  '/:id/confirm',
  validateParams(commonSchemas.mongoId),
  confirmPencilHold
);

// Admin only routes
router.use(requireAdmin);

router.patch(
  '/:id/approve',
  validateParams(commonSchemas.mongoId),
  approvePencilHold
);
router.patch(
  '/:id/cancel',
  validateParams(commonSchemas.mongoId),
  validateBody(pencilHoldSchemas.cancel),
  cancelPencilHold
);

export default router;
