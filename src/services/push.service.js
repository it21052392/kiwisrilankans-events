import webpush from 'web-push';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

class PushService {
  constructor() {
    // Configure web-push
    webpush.setVapidDetails(
      env.VAPID_EMAIL,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
  }

  async sendEventReminder(subscription, event) {
    const payload = JSON.stringify({
      title: `Event Reminder: ${event.title}`,
      body: `Don't forget! ${event.title} is tomorrow at ${new Date(event.startDate).toLocaleTimeString()}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: `${env.FRONTEND_URL}/events/${event.slug}`,
        eventId: event._id,
      },
      actions: [
        {
          action: 'view',
          title: 'View Event',
          icon: '/view-icon.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png',
        },
      ],
    });

    return await this.sendNotification(subscription, payload);
  }

  async sendEventUpdate(subscription, event, updateType) {
    let title, body;

    switch (updateType) {
      case 'cancelled':
        title = `Event Cancelled: ${event.title}`;
        body =
          'This event has been cancelled. We apologize for any inconvenience.';
        break;
      case 'updated':
        title = `Event Updated: ${event.title}`;
        body = 'This event has been updated. Check the details for changes.';
        break;
      case 'reminder':
        title = `Registration Deadline: ${event.title}`;
        body = `Registration closes soon for ${event.title}. Register now to secure your spot!`;
        break;
      default:
        title = `Event Update: ${event.title}`;
        body = 'There has been an update to this event.';
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: `${env.FRONTEND_URL}/events/${event.slug}`,
        eventId: event._id,
        updateType,
      },
      actions: [
        {
          action: 'view',
          title: 'View Event',
          icon: '/view-icon.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png',
        },
      ],
    });

    return await this.sendNotification(subscription, payload);
  }

  async sendPencilHoldUpdate(subscription, pencilHold, updateType) {
    let title, body;

    switch (updateType) {
      case 'confirmed':
        title = `Pencil Hold Confirmed: ${pencilHold.event.title}`;
        body =
          'Your pencil hold has been confirmed! You can now register for the event.';
        break;
      case 'cancelled':
        title = `Pencil Hold Cancelled: ${pencilHold.event.title}`;
        body = 'Your pencil hold has been cancelled.';
        break;
      case 'expiring':
        title = `Pencil Hold Expiring: ${pencilHold.event.title}`;
        body =
          'Your pencil hold will expire soon. Confirm it to secure your spot!';
        break;
      default:
        title = `Pencil Hold Update: ${pencilHold.event.title}`;
        body = 'There has been an update to your pencil hold.';
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: `${env.FRONTEND_URL}/pencil-holds/${pencilHold._id}`,
        pencilHoldId: pencilHold._id,
        updateType,
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/view-icon.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png',
        },
      ],
    });

    return await this.sendNotification(subscription, payload);
  }

  async sendGeneralNotification(subscription, title, body, data = {}) {
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: data.url || env.FRONTEND_URL,
        ...data,
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/view-icon.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png',
        },
      ],
    });

    return await this.sendNotification(subscription, payload);
  }

  async sendBulkNotification(subscriptions, title, body, data = {}) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const subscription of subscriptions) {
      try {
        await this.sendGeneralNotification(subscription, title, body, data);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          subscriptionId: subscription._id,
          error: error.message,
        });
        logger.error(
          `Failed to send push notification to subscription ${subscription._id}:`,
          error
        );
      }
    }

    return results;
  }

  async sendNotification(subscription, payload) {
    try {
      const pushSubscription = {
        endpoint: subscription.pushSubscription.endpoint,
        keys: {
          p256dh: subscription.pushSubscription.keys.p256dh,
          auth: subscription.pushSubscription.keys.auth,
        },
      };

      const result = await webpush.sendNotification(pushSubscription, payload);

      logger.info(
        `Push notification sent successfully to subscription ${subscription._id}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Failed to send push notification to subscription ${subscription._id}:`,
        error
      );

      // Handle specific error cases
      if (error.statusCode === 410) {
        // Subscription is no longer valid, should be removed
        logger.warn(
          `Subscription ${subscription._id} is no longer valid, should be removed`
        );
        throw new Error('Subscription expired');
      } else if (error.statusCode === 413) {
        // Payload too large
        logger.warn(`Payload too large for subscription ${subscription._id}`);
        throw new Error('Payload too large');
      } else {
        throw error;
      }
    }
  }

  async validateSubscription(subscription) {
    try {
      // Send a test notification to validate the subscription
      const testPayload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification to validate your subscription.',
        icon: '/icon-192x192.png',
      });

      await this.sendNotification(subscription, testPayload);
      return true;
    } catch (error) {
      logger.error(
        `Subscription validation failed for ${subscription._id}:`,
        error
      );
      return false;
    }
  }

  async getSubscriptionInfo(subscription) {
    try {
      // Extract information from the endpoint URL
      const url = new URL(subscription.pushSubscription.endpoint);
      const info = {
        endpoint: subscription.pushSubscription.endpoint,
        userAgent: subscription.userAgent || 'Unknown',
        platform: this.detectPlatform(url.hostname),
        createdAt: subscription.createdAt,
        lastUsed: subscription.lastUsed,
      };

      return info;
    } catch (error) {
      logger.error(
        `Failed to get subscription info for ${subscription._id}:`,
        error
      );
      return null;
    }
  }

  detectPlatform(hostname) {
    if (hostname.includes('fcm.googleapis.com')) {
      return 'Android';
    } else if (hostname.includes('wns2-')) {
      return 'Windows';
    } else if (hostname.includes('push.apple.com')) {
      return 'iOS';
    } else {
      return 'Web';
    }
  }

  async cleanupInvalidSubscriptions(subscriptions) {
    const invalidSubscriptions = [];

    for (const subscription of subscriptions) {
      try {
        const isValid = await this.validateSubscription(subscription);
        if (!isValid) {
          invalidSubscriptions.push(subscription._id);
        }
      } catch {
        invalidSubscriptions.push(subscription._id);
      }
    }

    return invalidSubscriptions;
  }
}

export const pushService = new PushService();
