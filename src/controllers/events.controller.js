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

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const event = await eventService.updateEvent(id, updateData);

  logger.info(`Event updated: ${event.title}`);

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event },
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await eventService.deleteEvent(id);

  logger.info(`Event deleted: ${id}`);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { additionalInfo } = req.body;

  const registration = await eventService.registerForEvent(
    id,
    userId,
    additionalInfo
  );

  logger.info(`User registered for event: ${id} - ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully registered for event',
    data: { registration },
  });
});

// @desc    Cancel event registration
// @route   DELETE /api/events/:id/register
// @access  Private
const cancelEventRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await eventService.cancelEventRegistration(id, userId);

  logger.info(`Event registration cancelled: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Event registration cancelled successfully',
  });
});

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private/Admin
const getEventRegistrations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const registrations = await eventService.getEventRegistrations(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: registrations,
  });
});

export {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations,
};
