import { Event } from '../models/event.model.js';
import { Category } from '../models/category.model.js';
import { PencilHold } from '../models/pencilHold.model.js';

class EventService {
  async getEvents({
    page = 1,
    limit = 10,
    search,
    category,
    status,
    startDate,
    endDate,
    sortBy = 'startDate',
    sortOrder = 'asc',
  }) {
    const query = { status: 'published' };

    // Apply filters
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

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .sort(sort)
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

  async getEventById(id) {
    const event = await Event.findById(id)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async createEvent(eventData) {
    const event = await Event.create(eventData);

    // Update category event count
    await Category.findByIdAndUpdate(eventData.category, {
      $inc: { eventCount: 1 },
    });

    return event;
  }

  async updateEvent(id, updateData) {
    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color icon');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async deleteEvent(id) {
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new Error('Event not found');
    }

    // Update category event count
    await Category.findByIdAndUpdate(event.category, {
      $inc: { eventCount: -1 },
    });

    return event;
  }

  async registerForEvent(eventId, userId, additionalInfo = {}) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'published') {
      throw new Error('Event is not available for registration');
    }

    if (event.registrationDeadline < new Date()) {
      throw new Error('Registration deadline has passed');
    }

    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is at full capacity');
    }

    // Check if user is already registered
    const existingRegistration = await Event.findOne({
      _id: eventId,
      'registrations.user': userId,
    });

    if (existingRegistration) {
      throw new Error('User is already registered for this event');
    }

    // Add registration
    event.registrations.push({
      user: userId,
      registeredAt: new Date(),
      additionalInfo,
    });

    event.registrationCount += 1;
    await event.save();

    return event.registrations[event.registrations.length - 1];
  }

  async cancelEventRegistration(eventId, userId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const registrationIndex = event.registrations.findIndex(
      reg => reg.user.toString() === userId.toString()
    );

    if (registrationIndex === -1) {
      throw new Error('User is not registered for this event');
    }

    event.registrations.splice(registrationIndex, 1);
    event.registrationCount -= 1;
    await event.save();

    return { success: true };
  }

  async getEventRegistrations(eventId, { page = 1, limit = 10 }) {
    const event = await Event.findById(eventId)
      .populate('registrations.user', 'name email')
      .select('registrations');

    if (!event) {
      throw new Error('Event not found');
    }

    const registrations = event.registrations.slice(
      (page - 1) * limit,
      page * limit
    );

    return {
      registrations,
      pagination: {
        page,
        limit,
        total: event.registrations.length,
        pages: Math.ceil(event.registrations.length / limit),
      },
    };
  }

  async getUpcomingEvents(hours = 24) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await Event.find({
      status: 'published',
      startDate: { $gte: now, $lte: futureDate },
    }).populate('category', 'name color');
  }

  async getEventsWithRegistrationDeadlines(hours = 12) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await Event.find({
      status: 'published',
      registrationDeadline: { $gte: now, $lte: futureDate },
    }).populate('category', 'name color');
  }

  async cleanupExpiredPencilHolds() {
    const result = await PencilHold.deleteMany({
      status: 'pending',
      expiresAt: { $lte: new Date() },
    });

    return { deletedCount: result.deletedCount };
  }

  async getWeeklyEvents() {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return await Event.find({
      status: 'published',
      startDate: { $gte: now, $lte: weekFromNow },
    }).populate('category', 'name color');
  }

  async cleanupOldEvents() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await Event.deleteMany({
      status: 'completed',
      endDate: { $lt: sixMonthsAgo },
    });

    return { deletedCount: result.deletedCount };
  }
}

export const eventService = new EventService();
