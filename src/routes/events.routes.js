import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations,
} from '../controllers/events.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin, requireAdminOrOrganizer } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { eventSchemas } from '../validators/events.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(eventSchemas.getEventsQuery), getEvents);
router.get('/:id', validateParams(commonSchemas.mongoId), getEventById);

// Protected routes
router.use(authenticate);

// User event registration
router.post(
  '/:id/register',
  validateParams(commonSchemas.mongoId),
  validateBody(eventSchemas.register),
  registerForEvent
);
router.delete(
  '/:id/register',
  validateParams(commonSchemas.mongoId),
  cancelEventRegistration
);

// Admin or Organizer routes
router.post(
  '/',
  requireAdminOrOrganizer,
  validateBody(eventSchemas.create),
  createEvent
);

// Admin only routes
router.use(requireAdmin);
router.put(
  '/:id',
  validateParams(commonSchemas.mongoId),
  validateBody(eventSchemas.update),
  updateEvent
);
router.delete('/:id', validateParams(commonSchemas.mongoId), deleteEvent);
router.get(
  '/:id/registrations',
  validateParams(commonSchemas.mongoId),
  validateQuery(commonSchemas.pagination),
  getEventRegistrations
);

export default router;
