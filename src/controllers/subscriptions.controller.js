import { asyncHandler } from '../utils/asyncHandler.js';
import { subscriptionService } from '../services/subscriptions.service.js';
import { logger } from '../config/logger.js';

// @desc    Subscribe to notifications
// @route   POST /api/subscriptions
// @access  Private
const subscribe = asyncHandler(async (req, res) => {
  const { type, preferences } = req.body;
  const userId = req.user._id;

  const subscription = await subscriptionService.subscribe(
    userId,
    type,
    preferences
  );

  logger.info(`User subscribed: ${type} - ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to notifications',
    data: { subscription },
  });
});

// @desc    Unsubscribe from notifications
// @route   DELETE /api/subscriptions/:id
// @access  Private
const unsubscribe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await subscriptionService.unsubscribe(id, userId);

  logger.info(`User unsubscribed: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Successfully unsubscribed from notifications',
  });
});

// @desc    Get user subscriptions
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private
const getMySubscriptions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, type } = req.query;

  const subscriptions = await subscriptionService.getUserSubscriptions(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  res.json({
    success: true,
    data: subscriptions,
  });
});

// @desc    Update subscription preferences
// @route   PUT /api/subscriptions/:id/preferences
// @access  Private
const updateSubscriptionPreferences = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { preferences } = req.body;
  const userId = req.user._id;

  const subscription = await subscriptionService.updatePreferences(
    id,
    preferences,
    userId
  );

  logger.info(`Subscription preferences updated: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Subscription preferences updated successfully',
    data: { subscription },
  });
});

// @desc    Subscribe to push notifications
// @route   POST /api/subscriptions/push
// @access  Private
const subscribeToPush = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user._id;

  const pushSubscription = await subscriptionService.subscribeToPush(
    userId,
    subscription
  );

  logger.info(`Push subscription created: ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to push notifications',
    data: { pushSubscription },
  });
});

// @desc    Unsubscribe from push notifications
// @route   DELETE /api/subscriptions/push/:id
// @access  Private
const unsubscribeFromPush = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await subscriptionService.unsubscribeFromPush(id, userId);

  logger.info(`Push subscription removed: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'Successfully unsubscribed from push notifications',
  });
});

// @desc    Get all subscriptions (Admin)
// @route   GET /api/subscriptions
// @access  Private/Admin
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status } = req.query;

  const subscriptions = await subscriptionService.getAllSubscriptions({
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    status,
  });

  res.json({
    success: true,
    data: subscriptions,
  });
});

// @desc    Send test notification
// @route   POST /api/subscriptions/test
// @access  Private/Admin
const sendTestNotification = asyncHandler(async (req, res) => {
  const { type, message, targetUsers } = req.body;

  const result = await subscriptionService.sendTestNotification({
    type,
    message,
    targetUsers,
  });

  logger.info(`Test notification sent: ${type} to ${result.sentCount} users`);

  res.json({
    success: true,
    message: `Test notification sent to ${result.sentCount} users`,
    data: result,
  });
});

export {
  subscribe,
  unsubscribe,
  getMySubscriptions,
  updateSubscriptionPreferences,
  subscribeToPush,
  unsubscribeFromPush,
  getAllSubscriptions,
  sendTestNotification,
};
