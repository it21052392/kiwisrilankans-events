import { User } from '../models/user.model.js';
import { Event } from '../models/event.model.js';
import { Category } from '../models/category.model.js';
import { PencilHold } from '../models/pencilHold.model.js';
import { Subscription } from '../models/subscription.model.js';
import { logger } from '../config/logger.js';

class AdminService {
  async getDashboardStats() {
    const [
      userStats,
      eventStats,
      categoryStats,
      pencilHoldStats,
      subscriptionStats,
    ] = await Promise.all([
      this.getUserStats(),
      this.getEventStats(),
      this.getCategoryStats(),
      this.getPencilHoldStats(),
      this.getSubscriptionStats(),
    ]);

    return {
      users: userStats,
      events: eventStats,
      categories: categoryStats,
      pencilHolds: pencilHoldStats,
      subscriptions: subscriptionStats,
    };
  }

  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const users = stats.find(stat => stat._id === 'user')?.count || 0;
    const moderators = stats.find(stat => stat._id === 'moderator')?.count || 0;
    const admins = stats.find(stat => stat._id === 'admin')?.count || 0;

    return {
      total,
      users,
      moderators,
      admins,
    };
  }

  async getEventStats() {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const published = stats.find(stat => stat._id === 'published')?.count || 0;
    const draft = stats.find(stat => stat._id === 'draft')?.count || 0;
    const cancelled = stats.find(stat => stat._id === 'cancelled')?.count || 0;
    const completed = stats.find(stat => stat._id === 'completed')?.count || 0;

    return {
      total,
      published,
      draft,
      cancelled,
      completed,
    };
  }

  async getCategoryStats() {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: '$active',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const active = stats.find(stat => stat._id === true)?.count || 0;
    const inactive = stats.find(stat => stat._id === false)?.count || 0;

    return {
      total,
      active,
      inactive,
    };
  }

  async getPencilHoldStats() {
    const stats = await PencilHold.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const pending = stats.find(stat => stat._id === 'pending')?.count || 0;
    const confirmed = stats.find(stat => stat._id === 'confirmed')?.count || 0;
    const cancelled = stats.find(stat => stat._id === 'cancelled')?.count || 0;
    const expired = stats.find(stat => stat._id === 'expired')?.count || 0;

    return {
      total,
      pending,
      confirmed,
      cancelled,
      expired,
    };
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
    };
  }

  async getAllUsers({ page = 1, limit = 10, search, role, status }) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-emailVerificationToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id) {
    const user = await User.findById(id)
      .select('-emailVerificationToken')
      .populate('createdBy', 'name email');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserRole(id, role) {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  async getAllEvents({
    page = 1,
    limit = 10,
    search,
    category,
    status,
    startDate,
    endDate,
  }) {
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Event.countDocuments(query);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getEventAnalytics(eventId) {
    const event = await Event.findById(eventId)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email');

    if (!event) {
      throw new Error('Event not found');
    }

    const registrations = await Event.aggregate([
      { $match: { _id: event._id } },
      { $unwind: '$registrations' },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          registrationsByDay: {
            $push: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$registrations.registeredAt',
                },
              },
            },
          },
        },
      },
    ]);

    const pencilHolds = await PencilHold.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return {
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        capacity: event.capacity,
        registrationCount: event.registrationCount,
        pencilHoldCount: event.pencilHoldCount,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      analytics: {
        totalRegistrations: registrations[0]?.totalRegistrations || 0,
        totalPencilHolds: pencilHolds.length,
        registrationRate:
          event.capacity > 0
            ? (event.registrationCount / event.capacity) * 100
            : 0,
        pencilHoldRate:
          event.capacity > 0
            ? (event.pencilHoldCount / event.capacity) * 100
            : 0,
      },
      pencilHolds: pencilHolds.slice(0, 10), // Last 10 pencil holds
    };
  }

  async getSystemLogs({
    page = 1,
    limit = 50,
    _level,
    _startDate,
    _endDate,
    _search,
  }) {
    // In a real implementation, you would query your logging system
    // For now, return mock data
    const logs = [
      {
        id: '1',
        level: 'info',
        message: 'Server started successfully',
        timestamp: new Date().toISOString(),
        source: 'server',
      },
      {
        id: '2',
        level: 'warn',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        source: 'monitor',
      },
    ];

    return {
      logs,
      pagination: {
        page,
        limit,
        total: logs.length,
        pages: Math.ceil(logs.length / limit),
      },
    };
  }

  async sendBulkNotification({
    title,
    _message,
    type,
    targetUsers,
    targetRoles,
  }) {
    let sentCount = 0;
    const errors = [];

    try {
      // Get target users based on criteria
      let users = [];

      if (targetUsers && targetUsers.length > 0) {
        users = await User.find({ _id: { $in: targetUsers } });
      } else if (targetRoles && targetRoles.length > 0) {
        users = await User.find({ role: { $in: targetRoles } });
      } else {
        users = await User.find({ isActive: true });
      }

      // Send notifications based on type
      for (const user of users) {
        try {
          if (type === 'email' || type === 'all') {
            // Here you would integrate with your email service
            logger.info(`Email sent to ${user.email}: ${title}`);
            sentCount++;
          }

          if (type === 'push' || type === 'all') {
            // Here you would integrate with your push notification service
            logger.info(`Push notification sent to ${user.email}: ${title}`);
            sentCount++;
          }
        } catch (error) {
          errors.push(
            `Failed to send notification to ${user.email}: ${error.message}`
          );
        }
      }

      return {
        sentCount,
        totalUsers: users.length,
        errors,
        success: errors.length === 0,
      };
    } catch (error) {
      logger.error('Bulk notification error:', error);
      throw new Error('Failed to send bulk notifications');
    }
  }

  // Event approval methods
  async approveEvent(eventId, adminId) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        {
          status: 'published',
          updatedBy: adminId,
          approvedAt: new Date(),
          approvedBy: adminId,
        },
        { new: true }
      ).populate('createdBy', 'name email');

      if (!event) {
        throw new Error('Event not found');
      }

      logger.info(`Event approved: ${event.title} by admin ${adminId}`);
      return event;
    } catch (error) {
      logger.error('Event approval error:', error);
      throw new Error('Failed to approve event');
    }
  }

  async rejectEvent(eventId, adminId, reason = '') {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        {
          status: 'cancelled',
          updatedBy: adminId,
          rejectedAt: new Date(),
          rejectedBy: adminId,
          rejectionReason: reason,
        },
        { new: true }
      ).populate('createdBy', 'name email');

      if (!event) {
        throw new Error('Event not found');
      }

      logger.info(
        `Event rejected: ${event.title} by admin ${adminId}. Reason: ${reason}`
      );
      return event;
    } catch (error) {
      logger.error('Event rejection error:', error);
      throw new Error('Failed to reject event');
    }
  }

  async getPendingEvents({ page = 1, limit = 10 }) {
    try {
      const query = { status: 'draft' };
      const skip = (page - 1) * limit;

      const events = await Event.find(query)
        .populate('createdBy', 'name email role')
        .populate('category', 'name color icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Event.countDocuments(query);

      return {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get pending events error:', error);
      throw new Error('Failed to get pending events');
    }
  }
}

export const adminService = new AdminService();
