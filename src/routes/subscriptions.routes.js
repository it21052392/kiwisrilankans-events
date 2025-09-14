import express from 'express';
import {
  subscribe,
  unsubscribe,
  getMySubscriptions,
  updateSubscriptionPreferences,
  subscribeToPush,
  unsubscribeFromPush,
  getAllSubscriptions,
  sendTestNotification,
} from '../controllers/subscriptions.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { subscriptionSchemas } from '../validators/subscriptions.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Protected routes
router.use(authenticate);

// User subscription management
router.post('/', validateBody(subscriptionSchemas.subscribe), subscribe);
router.delete('/:id', validateParams(commonSchemas.mongoId), unsubscribe);
router.get(
  '/my-subscriptions',
  validateQuery(commonSchemas.pagination),
  getMySubscriptions
);
router.put(
  '/:id/preferences',
  validateParams(commonSchemas.mongoId),
  validateBody(subscriptionSchemas.updatePreferences),
  updateSubscriptionPreferences
);

// Push notification subscriptions
router.post(
  '/push',
  validateBody(subscriptionSchemas.pushSubscribe),
  subscribeToPush
);
router.delete(
  '/push/:id',
  validateParams(commonSchemas.mongoId),
  unsubscribeFromPush
);

// Admin only routes
router.use(requireAdmin);

router.get('/', validateQuery(commonSchemas.pagination), getAllSubscriptions);
router.post(
  '/test',
  validateBody(subscriptionSchemas.testNotification),
  sendTestNotification
);

export default router;
