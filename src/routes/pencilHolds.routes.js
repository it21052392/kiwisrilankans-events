import express from 'express';
import {
  getPencilHolds,
  getPencilHoldById,
  createPencilHold,
  updatePencilHold,
  deletePencilHold,
  getMyPencilHolds,
  getOrganizerPencilHolds,
  confirmPencilHold,
  approvePencilHold,
  cancelPencilHold,
  getEventsWithPencilHolds,
  handleExpiredPencilHolds,
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
router.get(
  '/organizer-holds',
  validateQuery(commonSchemas.pagination),
  getOrganizerPencilHolds
);

// Admin routes for viewing all pencil holds
router.get('/', validateQuery(commonSchemas.pagination), getPencilHolds);

// Organizer confirmation route (moved up before admin-only routes)
router.patch(
  '/:id/confirm',
  validateParams(commonSchemas.mongoId),
  confirmPencilHold
);

// Admin only routes
router.use(requireAdmin);

router.get(
  '/events',
  validateQuery(commonSchemas.pagination),
  getEventsWithPencilHolds
);

// Move specific routes after general routes
router.get('/:id', validateParams(commonSchemas.mongoId), getPencilHoldById);
router.post('/expired', handleExpiredPencilHolds);
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
