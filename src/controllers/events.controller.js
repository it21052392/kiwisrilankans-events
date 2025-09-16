import { asyncHandler } from '../utils/asyncHandler.js';
import { eventService } from '../services/events.service.js';
import { logger } from '../config/logger.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    startDate,
    endDate,
    sortBy = 'startDate',
    sortOrder = 'asc',
    view = 'list',
    hidePast = true,
    organizerId,
  } = req.query;

  const events = await eventService.getEvents({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    category,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    view,
    hidePast: hidePast === 'true',
    organizerId,
  });

  res.json({
    success: true,
    data: events,
  });
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await eventService.getEventById(id);

  res.json({
    success: true,
    data: { event },
  });
});

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const eventData = req.body;
  const userId = req.user._id;

  const event = await eventService.createEvent({
    ...eventData,
    createdBy: userId,
  });

  logger.info(`Event created: ${event.title}`);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event },
  });
});

// @desc    Update event (Admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const event = await eventService.updateEvent(id, updateData);

  logger.info(`Event updated by admin: ${event.title}`);

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event },
  });
});

// @desc    Update event by organizer
// @route   PUT /api/events/:id/organizer
// @access  Private/Organizer
const updateEventByOrganizer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user._id;

  const event = await eventService.updateEventByOrganizer(
    id,
    updateData,
    userId
  );

  logger.info(`Event updated by organizer: ${event.title} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event },
  });
});

// @desc    Delete event (Admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await eventService.deleteEvent(id);

  logger.info(`Event deleted by admin: ${id}`);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

// @desc    Delete event by organizer
// @route   DELETE /api/events/:id/organizer
// @access  Private/Organizer
const deleteEventByOrganizer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await eventService.deleteEventByOrganizer(id, userId);

  logger.info(`Event deleted by organizer: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

// @desc    Get events for calendar view
// @route   GET /api/events/calendar
// @access  Public
const getEventsForCalendar = asyncHandler(async (req, res) => {
  const { startDate, endDate, category, search } = req.query;

  const events = await eventService.getEventsForCalendar({
    startDate,
    endDate,
    category,
    search,
  });

  res.json({
    success: true,
    data: events,
  });
});

// @desc    Get events for grid view
// @route   GET /api/events/grid
// @access  Public
const getEventsForGrid = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'startDate',
    sortOrder = 'asc',
  } = req.query;

  const events = await eventService.getEventsForGrid({
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    search,
    sortBy,
    sortOrder,
  });

  res.json({
    success: true,
    data: events,
  });
});

// @desc    Get event by slug (public)
// @route   GET /api/events/slug/:slug
// @access  Public
const getEventBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const event = await eventService.getEventBySlug(slug);

  res.json({
    success: true,
    data: { event },
  });
});

// @desc    Get search suggestions
// @route   GET /api/events/search/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  if (!searchTerm || searchTerm.length < 2) {
    return res.json({
      success: true,
      data: {
        suggestions: [],
        tags: [],
        total: 0,
      },
    });
  }

  const suggestions = await eventService.getSearchSuggestions(
    searchTerm,
    parseInt(limit)
  );

  res.json({
    success: true,
    data: suggestions,
  });
});

// @desc    Soft delete event
// @route   DELETE /api/events/:id/soft
// @access  Admin
const softDeleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await eventService.softDeleteEvent(id, userId);

  logger.info(`Event soft deleted: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

// @desc    Restore event
// @route   PATCH /api/events/:id/restore
// @access  Admin
const restoreEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await eventService.restoreEvent(id);

  logger.info(`Event restored: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event restored successfully',
  });
});

// @desc    Unpublish event
// @route   PATCH /api/events/:id/unpublish
// @access  Admin
const unpublishEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  await eventService.unpublishEvent(id, adminId);

  logger.info(`Event unpublished: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event unpublished successfully',
  });
});

// @desc    Update event pencil hold status
// @route   PATCH /api/events/:id/pencil-hold-status
// @access  Private/Admin
const updateEventPencilHoldStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, pencilHoldInfo } = req.body;

  const event = await eventService.updateEventPencilHoldStatus(
    id,
    status,
    pencilHoldInfo
  );

  logger.info(`Event pencil hold status updated: ${id} - ${status}`);

  res.json({
    success: true,
    message: 'Event pencil hold status updated successfully',
    data: { event },
  });
});

export {
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
};
