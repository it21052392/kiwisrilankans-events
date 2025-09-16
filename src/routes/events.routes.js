import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventByOrganizer,
  deleteEvent,
  deleteEventByOrganizer,
  getEventsForCalendar,
  getEventsForGrid,
  getEventBySlug,
  getSearchSuggestions,
  softDeleteEvent,
  restoreEvent,
  unpublishEvent,
  updateEventPencilHoldStatus,
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
router.get('/calendar', getEventsForCalendar);
router.get('/grid', getEventsForGrid);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id', validateParams(commonSchemas.mongoId), getEventById);

// Protected routes
router.use(authenticate);

// Admin or Organizer routes
router.post(
  '/',
  requireAdminOrOrganizer,
  validateBody(eventSchemas.create),
  createEvent
);

// Organizer routes (for their own events)
router.put(
  '/:id/organizer',
  requireAdminOrOrganizer,
  validateParams(commonSchemas.mongoId),
  validateBody(eventSchemas.updateByOrganizer),
  updateEventByOrganizer
);
router.delete(
  '/:id/organizer',
  requireAdminOrOrganizer,
  validateParams(commonSchemas.mongoId),
  deleteEventByOrganizer
);

// Admin routes
router.delete(
  '/:id/soft',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  softDeleteEvent
);
router.patch(
  '/:id/restore',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  restoreEvent
);
router.patch(
  '/:id/unpublish',
  requireAdmin,
  validateParams(commonSchemas.mongoId),
  unpublishEvent
);

// Admin only routes
router.use(requireAdmin);
router.put(
  '/:id',
  validateParams(commonSchemas.mongoId),
  validateBody(eventSchemas.update),
  updateEvent
);
router.patch(
  '/:id/pencil-hold-status',
  validateParams(commonSchemas.mongoId),
  updateEventPencilHoldStatus
);
router.delete('/:id', validateParams(commonSchemas.mongoId), deleteEvent);

export default router;
