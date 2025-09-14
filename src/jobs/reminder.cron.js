import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { eventService } from '../services/events.service.js';
import { subscriptionService } from '../services/subscriptions.service.js';
import { mailService } from '../services/mail.service.js';
import { pushService } from '../services/push.service.js';

// Event reminder job - runs every hour
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Starting event reminder job...');

    // Get events starting in the next 24 hours
    const upcomingEvents = await eventService.getUpcomingEvents(24);

    for (const event of upcomingEvents) {
      // Get subscribers for this event
      const subscribers = await subscriptionService.getEventSubscribers(
        event._id
      );

      // Send email reminders
      for (const subscriber of subscribers.email) {
        try {
          await mailService.sendEventReminder(subscriber.email, event);
          logger.info(
            `Event reminder sent to ${subscriber.email} for event: ${event.title}`
          );
        } catch (error) {
          logger.error(
            `Failed to send email reminder to ${subscriber.email}:`,
            error
          );
        }
      }

      // Send push notifications
      for (const subscriber of subscribers.push) {
        try {
          await pushService.sendEventReminder(subscriber, event);
          logger.info(
            `Push reminder sent to ${subscriber.userId} for event: ${event.title}`
          );
        } catch (error) {
          logger.error(
            `Failed to send push reminder to ${subscriber.userId}:`,
            error
          );
        }
      }
    }

    logger.info(
      `Event reminder job completed. Processed ${upcomingEvents.length} events`
    );
  } catch (error) {
    logger.error('Event reminder job failed:', error);
  }
});

// Event registration deadline reminder - runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Starting registration deadline reminder job...');

    // Get events with registration deadlines in the next 12 hours
    const eventsWithDeadlines =
      await eventService.getEventsWithRegistrationDeadlines(12);

    for (const event of eventsWithDeadlines) {
      // Get users who haven't registered yet
      const unregisteredUsers = await eventService.getUnregisteredUsers(
        event._id
      );

      // Send deadline reminders
      for (const user of unregisteredUsers) {
        try {
          await mailService.sendRegistrationDeadlineReminder(user.email, event);
          logger.info(
            `Registration deadline reminder sent to ${user.email} for event: ${event.title}`
          );
        } catch (error) {
          logger.error(
            `Failed to send deadline reminder to ${user.email}:`,
            error
          );
        }
      }
    }

    logger.info(
      `Registration deadline reminder job completed. Processed ${eventsWithDeadlines.length} events`
    );
  } catch (error) {
    logger.error('Registration deadline reminder job failed:', error);
  }
});

// Cleanup expired pencil holds - runs daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Starting pencil hold cleanup job...');

    const result = await eventService.cleanupExpiredPencilHolds();

    logger.info(
      `Pencil hold cleanup completed. Removed ${result.deletedCount} expired holds`
    );
  } catch (error) {
    logger.error('Pencil hold cleanup job failed:', error);
  }
});

// Weekly digest - runs every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  try {
    logger.info('Starting weekly digest job...');

    // Get events for the upcoming week
    const weeklyEvents = await eventService.getWeeklyEvents();

    // Get all active subscribers
    const subscribers = await subscriptionService.getWeeklyDigestSubscribers();

    // Send weekly digest
    for (const subscriber of subscribers) {
      try {
        await mailService.sendWeeklyDigest(subscriber.email, weeklyEvents);
        logger.info(`Weekly digest sent to ${subscriber.email}`);
      } catch (error) {
        logger.error(
          `Failed to send weekly digest to ${subscriber.email}:`,
          error
        );
      }
    }

    logger.info(
      `Weekly digest job completed. Sent to ${subscribers.length} subscribers`
    );
  } catch (error) {
    logger.error('Weekly digest job failed:', error);
  }
});

// Database cleanup - runs weekly on Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  try {
    logger.info('Starting database cleanup job...');

    // Clean up old logs, expired sessions, etc.
    const cleanupResults = await Promise.all([
      eventService.cleanupOldEvents(),
      subscriptionService.cleanupOldSubscriptions(),
    ]);

    logger.info('Database cleanup job completed:', cleanupResults);
  } catch (error) {
    logger.error('Database cleanup job failed:', error);
  }
});

logger.info('Cron jobs initialized successfully');
