import { asyncHandler } from '../utils/asyncHandler.js';
import { pencilHoldService } from '../services/pencilHolds.service.js';
import { eventService } from '../services/events.service.js';
import { logger } from '../config/logger.js';

// @desc    Get all pencil holds
// @route   GET /api/pencil-holds
// @access  Public
const getPencilHolds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, eventId } = req.query;

  const pencilHolds = await pencilHoldService.getPencilHolds({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    status,
    eventId,
  });

  res.json({
    success: true,
    data: pencilHolds,
  });
});

// @desc    Get pencil hold by ID
// @route   GET /api/pencil-holds/:id
// @access  Public
const getPencilHoldById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pencilHold = await pencilHoldService.getPencilHoldById(id);

  res.json({
    success: true,
    data: { pencilHold },
  });
});

// @desc    Create pencil hold
// @route   POST /api/pencil-holds
// @access  Private
const createPencilHold = asyncHandler(async (req, res) => {
  const pencilHoldData = req.body;
  const userId = req.user._id;

  const pencilHold = await pencilHoldService.createPencilHold({
    ...pencilHoldData,
    userId,
    createdBy: userId,
  });

  logger.info(
    `Pencil hold created: ${pencilHold.event.title} - ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    message: 'Pencil hold created successfully',
    data: { pencilHold },
  });
});

// @desc    Update pencil hold
// @route   PUT /api/pencil-holds/:id
// @access  Private
const updatePencilHold = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user._id;

  const pencilHold = await pencilHoldService.updatePencilHold(
    id,
    updateData,
    userId
  );

  logger.info(`Pencil hold updated: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Pencil hold updated successfully',
    data: { pencilHold },
  });
});

// @desc    Delete pencil hold
// @route   DELETE /api/pencil-holds/:id
// @access  Private
const deletePencilHold = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await pencilHoldService.deletePencilHold(id, userId);

  logger.info(`Pencil hold deleted: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Pencil hold deleted successfully',
  });
});

// @desc    Get user's pencil holds
// @route   GET /api/pencil-holds/my-holds
// @access  Private
const getMyPencilHolds = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const pencilHolds = await pencilHoldService.getUserPencilHolds(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  res.json({
    success: true,
    data: pencilHolds,
  });
});

// @desc    Get organizer's pencil holds (for events they created)
// @route   GET /api/pencil-holds/organizer-holds
// @access  Private/Organizer
const getOrganizerPencilHolds = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const pencilHolds = await pencilHoldService.getOrganizerPencilHolds(
    organizerId,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    }
  );

  res.json({
    success: true,
    data: pencilHolds,
  });
});

// @desc    Confirm pencil hold by organizer
// @route   PATCH /api/pencil-holds/:id/confirm
// @access  Private/Organizer
const confirmPencilHold = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const pencilHold = await pencilHoldService.confirmPencilHoldByOrganizer(
    id,
    userId
  );

  logger.info(`Pencil hold confirmed by organizer: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Pencil hold confirmed successfully. Waiting for admin approval.',
    data: { pencilHold },
  });
});

// @desc    Approve pencil hold (Admin)
// @route   PATCH /api/pencil-holds/:id/approve
// @access  Private/Admin
const approvePencilHold = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pencilHold = await pencilHoldService.approvePencilHold(id);

  logger.info(`Pencil hold approved by admin: ${id}`);

  res.json({
    success: true,
    message: 'Pencil hold approved successfully. Event is now published.',
    data: { pencilHold },
  });
});

// @desc    Cancel pencil hold
// @route   PATCH /api/pencil-holds/:id/cancel
// @access  Private/Admin
const cancelPencilHold = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const pencilHold = await pencilHoldService.cancelPencilHold(id, reason);

  logger.info(`Pencil hold cancelled: ${id} - ${reason}`);

  res.json({
    success: true,
    message: 'Pencil hold cancelled successfully',
    data: { pencilHold },
  });
});

// @desc    Get events with pencil holds
// @route   GET /api/pencil-holds/events
// @access  Private/Admin
const getEventsWithPencilHolds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const events = await eventService.getEventsWithPencilHolds({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  res.json({
    success: true,
    data: events,
  });
});

// @desc    Handle expired pencil holds
// @route   POST /api/pencil-holds/expired
// @access  Private/Admin
const handleExpiredPencilHolds = asyncHandler(async (req, res) => {
  const expiredCount = await pencilHoldService.handleExpiredPencilHolds();

  logger.info(`Processed ${expiredCount} expired pencil holds`);

  res.json({
    success: true,
    message: `Processed ${expiredCount} expired pencil holds`,
    data: { expiredCount },
  });
});

export {
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
};
