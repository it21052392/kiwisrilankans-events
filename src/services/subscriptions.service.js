import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { Event } from '../models/event.model.js';
import { logger } from '../config/logger.js';

class SubscriptionService {
  async subscribe(userId, type, preferences = {}) {
    // Check if user already has this type of subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      type: { $in: [type, 'all'] },
      status: 'active',
    });

    if (existingSubscription) {
      throw new Error('User already has an active subscription of this type');
    }

    const subscription = await Subscription.create({
      user: userId,
      type,
      preferences,
    });

    return subscription;
  }

  async unsubscribe(id, userId) {
    const subscription = await Subscription.findOne({
      _id: id,
      user: userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await subscription.cancel();
    return { success: true };
  }

  async getUserSubscriptions(userId, { page = 1, limit = 10, type }) {
    const query = { user: userId };

    if (type) {
      query.type = { $in: [type, 'all'] };
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Subscription.countDocuments(query);

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updatePreferences(id, preferences, userId) {
    const subscription = await Subscription.findOne({
      _id: id,
      user: userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await subscription.updatePreferences(preferences);
    return subscription;
  }

  async subscribeToPush(userId, pushSubscription) {
    // Check if user already has a push subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      type: { $in: ['push', 'all'] },
      status: 'active',
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.pushSubscription = pushSubscription;
      await existingSubscription.save();
      return existingSubscription;
    }

    const subscription = await Subscription.create({
      user: userId,
      type: 'push',
      pushSubscription,
    });

    return subscription;
  }

  async unsubscribeFromPush(id, userId) {
    const subscription = await Subscription.findOne({
      _id: id,
      user: userId,
      type: { $in: ['push', 'all'] },
    });

    if (!subscription) {
      throw new Error('Push subscription not found');
    }

    await subscription.cancel();
    return { success: true };
  }

  async getAllSubscriptions({ page = 1, limit = 10, type, status }) {
    const query = {};

    if (type) {
      query.type = { $in: [type, 'all'] };
    }

    if (status) {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Subscription.countDocuments(query);

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getEventSubscribers(eventId) {
    const event = await Event.findById(eventId).populate('category');

    if (!event) {
      throw new Error('Event not found');
    }

    // Get email subscribers
    const emailSubscribers = await Subscription.findEmailSubscriptions();

    // Get push subscribers
    const pushSubscribers = await Subscription.findPushSubscriptions();

    return {
      email: emailSubscribers,
      push: pushSubscribers,
    };
  }

  async getWeeklyDigestSubscribers() {
    return await Subscription.find({
      type: { $in: ['email', 'all'] },
      status: 'active',
      isVerified: true,
      'preferences.weeklyDigest': true,
    }).populate('user', 'name email');
  }

  async sendTestNotification({ type, message, targetUsers }) {
    let sentCount = 0;
    const errors = [];

    try {
      if (type === 'email') {
        // Send test email notifications
        for (const userId of targetUsers) {
          try {
            const user = await User.findById(userId);
            if (user) {
              // Here you would integrate with your email service
              logger.info(`Test email sent to ${user.email}: ${message}`);
              sentCount++;
            }
          } catch (error) {
            errors.push(
              `Failed to send email to user ${userId}: ${error.message}`
            );
          }
        }
      } else if (type === 'push') {
        // Send test push notifications
        const pushSubscriptions = await Subscription.find({
          user: { $in: targetUsers },
          type: { $in: ['push', 'all'] },
          status: 'active',
        });

        for (const subscription of pushSubscriptions) {
          try {
            // Here you would integrate with your push notification service
            logger.info(
              `Test push sent to user ${subscription.user}: ${message}`
            );
            sentCount++;
          } catch (error) {
            errors.push(
              `Failed to send push to user ${subscription.user}: ${error.message}`
            );
          }
        }
      }

      return {
        sentCount,
        errors,
        success: errors.length === 0,
      };
    } catch (error) {
      logger.error('Test notification error:', error);
      throw new Error('Failed to send test notifications');
    }
  }

  async verifySubscription(token) {
    const subscription = await Subscription.findByVerificationToken(token);

    if (!subscription) {
      throw new Error('Invalid verification token');
    }

    await subscription.verify();
    return subscription;
  }

  async pauseSubscription(id, userId) {
    const subscription = await Subscription.findOne({
      _id: id,
      user: userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await subscription.pause();
    return subscription;
  }

  async resumeSubscription(id, userId) {
    const subscription = await Subscription.findOne({
      _id: id,
      user: userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await subscription.resume();
    return subscription;
  }

  async cleanupOldSubscriptions() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await Subscription.deleteMany({
      status: 'cancelled',
      updatedAt: { $lt: sixMonthsAgo },
    });

    return { deletedCount: result.deletedCount };
  }

  async getSubscriptionStats() {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const active = stats
      .filter(stat => stat._id.status === 'active')
      .reduce((sum, stat) => sum + stat.count, 0);
    const paused = stats
      .filter(stat => stat._id.status === 'paused')
      .reduce((sum, stat) => sum + stat.count, 0);
    const cancelled = stats
      .filter(stat => stat._id.status === 'cancelled')
      .reduce((sum, stat) => sum + stat.count, 0);

    return {
      total,
      active,
      paused,
      cancelled,
      breakdown: stats,
    };
  }
}

export const subscriptionService = new SubscriptionService();
