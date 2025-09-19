import { Event } from '../models/event.model.js';
import { Category } from '../models/category.model.js';
import { PencilHold } from '../models/pencilHold.model.js';
import { uploadService } from './uploads.service.js';

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
    view = 'list', // list, grid, calendar
    hidePast = true,
    organizerId,
  }) {
    const query = { isDeleted: false };

    // If organizerId is provided, show all events by that organizer regardless of status
    // Otherwise, show published and pencil hold events
    if (organizerId) {
      query.createdBy = organizerId;
    } else {
      query.status = {
        $in: ['published', 'pencil_hold', 'pencil_hold_confirmed'],
      };
    }

    // Hide past events by default (only for public view, not for organizer view)
    if (hidePast && !organizerId) {
      query.$and = [
        {
          $or: [
            { endDate: { $gte: new Date() } },
            { endDate: { $exists: false } },
          ],
        },
      ];
    }

    // Apply filters
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      };

      if (query.$and) {
        query.$and.push(searchCondition);
      } else {
        query.$or = searchCondition.$or;
      }
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
      view,
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

  async getEventBySlug(slug) {
    const event = await Event.findBySlug(slug)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email');

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
    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      if (endDate < startDate) {
        throw new Error('End date must be on or after start date');
      }
    }

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: false, // Disable validators to avoid the field-level validation issue
    }).populate('category', 'name color icon');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async updateEventByOrganizer(id, updateData, userId) {
    // First check if the event exists and the user is the creator
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.createdBy.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only update events you created');
    }

    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      if (endDate < startDate) {
        throw new Error('End date must be on or after start date');
      }
    }

    // Update the event with the new data and set updatedBy
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: userId,
      },
      {
        new: true,
        runValidators: false, // Disable validators to avoid the field-level validation issue
      }
    ).populate('category', 'name color icon');

    return updatedEvent;
  }

  async deleteEvent(id) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    try {
      // Delete associated images from S3
      if (event.images && event.images.length > 0) {
        const imageUrls = event.images.map(img => img.url);
        const deleteResult = await uploadService.deleteMultipleFilesByUrls(
          imageUrls,
          event.createdBy
        );

        if (!deleteResult.success) {
          console.warn(
            `Some images could not be deleted for event ${id}:`,
            deleteResult.results
          );
        }
      }

      // Delete associated pencil holds
      const pencilHoldResult = await PencilHold.deleteMany({ event: id });
      console.log(
        `Deleted ${pencilHoldResult.deletedCount} pencil holds for event ${id}`
      );

      // Delete the event
      await Event.findByIdAndDelete(id);

      // Update category event count
      await Category.findByIdAndUpdate(event.category, {
        $inc: { eventCount: -1 },
      });

      return event;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async softDeleteEvent(id, deletedBy) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    try {
      // Delete associated images from S3
      if (event.images && event.images.length > 0) {
        const imageUrls = event.images.map(img => img.url);
        const deleteResult = await uploadService.deleteMultipleFilesByUrls(
          imageUrls,
          deletedBy
        );

        if (!deleteResult.success) {
          console.warn(
            `Some images could not be deleted for event ${id}:`,
            deleteResult.results
          );
        }
      }

      // Delete associated pencil holds
      const pencilHoldResult = await PencilHold.deleteMany({ event: id });
      console.log(
        `Deleted ${pencilHoldResult.deletedCount} pencil holds for event ${id}`
      );

      // Soft delete the event
      await event.softDelete(deletedBy);

      return { message: 'Event deleted successfully' };
    } catch (error) {
      console.error(`Error soft deleting event ${id}:`, error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async restoreEvent(id) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.isDeleted) {
      throw new Error('Event is not deleted');
    }

    await event.restore();

    return { message: 'Event restored successfully' };
  }

  async unpublishEvent(id, adminId) {
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'published') {
      throw new Error('Only published events can be unpublished');
    }

    event.status = 'unpublished';
    event.unpublishedBy = adminId;
    event.unpublishedAt = new Date();
    await event.save();

    return { message: 'Event unpublished successfully' };
  }

  async deleteEventByOrganizer(id, userId) {
    // First check if the event exists and the user is the creator
    const event = await Event.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.createdBy.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only delete events you created');
    }

    try {
      // Delete associated images from S3
      if (event.images && event.images.length > 0) {
        const imageUrls = event.images.map(img => img.url);
        const deleteResult = await uploadService.deleteMultipleFilesByUrls(
          imageUrls,
          userId
        );

        if (!deleteResult.success) {
          console.warn(
            `Some images could not be deleted for event ${id}:`,
            deleteResult.results
          );
        }
      }

      // Delete associated pencil holds
      const pencilHoldResult = await PencilHold.deleteMany({ event: id });
      console.log(
        `Deleted ${pencilHoldResult.deletedCount} pencil holds for event ${id}`
      );

      // Delete the event
      const deletedEvent = await Event.findByIdAndDelete(id);

      // Update category event count
      await Category.findByIdAndUpdate(deletedEvent.category, {
        $inc: { eventCount: -1 },
      });

      return deletedEvent;
    } catch (error) {
      console.error(`Error deleting event ${id} by organizer:`, error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async getUpcomingEvents(hours = 24) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await Event.find({
      status: 'published',
      startDate: { $gte: now, $lte: futureDate },
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

  async getEventsForCalendar({ startDate, endDate, category, search }) {
    const query = {
      status: {
        $in: [
          'published',
          'pencil_hold',
          'pencil_hold_confirmed',
          'draft',
          'pending_approval',
        ],
      }, // Include more event statuses for testing
      isDeleted: false,
      // Remove the future events filter for now to see all events
      // $or: [{ endDate: { $gte: new Date() } }, { endDate: { $exists: false } }], // Only future events or events without endDate
    };

    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .select(
        '_id title slug startDate endDate startTime endTime location category images price currency status pencilHoldInfo createdBy'
      )
      .sort({ startDate: 1 });

    // Debug logging
    console.log('Calendar Events Debug:', {
      query,
      eventsCount: events.length,
      events: events.map(e => ({
        id: e._id,
        title: e.title,
        startDate: e.startDate,
        status: e.status,
      })),
    });

    // Group events by date for calendar view
    const eventsByDate = {};
    events.forEach(event => {
      // Use local date formatting to avoid timezone issues
      const year = event.startDate.getFullYear();
      const month = String(event.startDate.getMonth() + 1).padStart(2, '0');
      const day = String(event.startDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    return {
      events,
      eventsByDate,
      total: events.length,
    };
  }

  async getEventsForGrid({
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'startDate',
    sortOrder = 'asc',
  }) {
    const query = {
      status: { $in: ['published', 'pencil_hold', 'pencil_hold_confirmed'] }, // Include pencil hold events
      isDeleted: false,
      $or: [{ endDate: { $gte: new Date() } }, { endDate: { $exists: false } }], // Only future events or events without endDate
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .select(
        'title description startDate endDate startTime endTime location category images price currency capacity featured status pencilHoldInfo createdBy'
      )
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

  // Search suggestions for autocomplete
  async getSearchSuggestions(searchTerm, limit = 10) {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        suggestions: [],
        total: 0,
      };
    }

    const query = {
      status: 'published',
      isDeleted: false,
      endDate: { $gte: new Date() }, // Only future events
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    };

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .select(
        '_id title slug startDate endDate location category price currency'
      )
      .sort({ startDate: 1 })
      .limit(limit);

    // Extract unique tags that match the search term
    const allEvents = await Event.find({
      status: 'published',
      isDeleted: false,
      endDate: { $gte: new Date() },
      tags: { $in: [new RegExp(searchTerm, 'i')] },
    }).select('tags');

    const matchingTags = [
      ...new Set(
        allEvents.flatMap(event =>
          event.tags.filter(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      ),
    ].slice(0, 5);

    return {
      suggestions: events,
      tags: matchingTags,
      total: events.length,
    };
  }

  async getEventsWithPencilHolds({ page = 1, limit = 10, status }) {
    const query = {
      isDeleted: false,
      status: { $in: ['pencil_hold', 'pencil_hold_confirmed'] },
    };

    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('category', 'name color icon')
      .populate('createdBy', 'name email')
      .populate('pencilHoldInfo.pencilHoldId')
      .sort({ 'pencilHoldInfo.priority': -1, createdAt: -1 })
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

  async updateEventPencilHoldStatus(eventId, status, pencilHoldInfo = null) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.status = status;
    if (pencilHoldInfo) {
      event.pencilHoldInfo = pencilHoldInfo;
    }

    await event.save();
    return event;
  }
}

export const eventService = new EventService();
