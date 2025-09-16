import { PencilHold } from '../models/pencilHold.model.js';
import { Event } from '../models/event.model.js';

class PencilHoldService {
  async getPencilHolds({ page = 1, limit = 10, search, status, eventId }) {
    const query = {};

    if (search) {
      query.$or = [{ notes: { $regex: search, $options: 'i' } }];
    }

    if (status) {
      query.status = status;
    }

    if (eventId) {
      query.event = eventId;
    }

    const pencilHolds = await PencilHold.find(query)
      .populate('event', 'title startDate location')
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PencilHold.countDocuments(query);

    return {
      pencilHolds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPencilHoldById(id) {
    const pencilHold = await PencilHold.findById(id)
      .populate('event', 'title startDate location capacity registrationCount')
      .populate('user', 'name email')
      .populate('createdBy', 'name email');

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    return pencilHold;
  }

  async createPencilHold(pencilHoldData) {
    const { eventId, userId, createdBy, ...otherData } = pencilHoldData;

    // Check if event exists and is available
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Allow pencil holds for draft events (new logic)
    if (!['draft', 'published'].includes(event.status)) {
      throw new Error('Event is not available for pencil holds');
    }

    // Check if event already has a pencil hold
    if (
      event.status === 'pencil_hold' ||
      event.status === 'pencil_hold_confirmed'
    ) {
      throw new Error('Event already has a pencil hold');
    }

    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is at full capacity');
    }

    // Check for time/location conflicts with other penciled events
    await this.checkTimeLocationConflicts(event);

    // Check if user already has a pencil hold for this event
    const existingHold = await PencilHold.findOne({
      event: eventId,
      user: userId,
    });

    if (existingHold) {
      throw new Error('User already has a pencil hold for this event');
    }

    const pencilHold = await PencilHold.create({
      event: eventId,
      user: userId,
      createdBy: createdBy || userId, // Use provided createdBy or default to userId
      ...otherData,
    });

    // Update event status to pencil_hold
    event.status = 'pencil_hold';
    event.pencilHoldInfo = {
      pencilHoldId: pencilHold._id,
      expiresAt: pencilHold.expiresAt,
      notes: pencilHold.notes,
      priority: pencilHold.priority,
    };
    await event.save();

    return await this.getPencilHoldById(pencilHold._id);
  }

  async checkTimeLocationConflicts(event) {
    // Check for conflicts with other penciled events at the same time/location
    const conflictingHolds = await PencilHold.find({
      status: { $in: ['pending', 'confirmed'] },
      expiresAt: { $gt: new Date() },
      event: { $ne: event._id },
    }).populate('event', 'startDate endDate location');

    for (const hold of conflictingHolds) {
      const holdEvent = hold.event;

      // Check if events overlap in time
      const timeOverlap =
        event.startDate < holdEvent.endDate &&
        event.endDate > holdEvent.startDate;

      // Check if events are at the same location
      const sameLocation =
        event.location.name === holdEvent.location.name &&
        event.location.address === holdEvent.location.address;

      if (timeOverlap && sameLocation) {
        throw new Error(
          `Time slot conflict: Another penciled event exists at the same time and location`
        );
      }
    }
  }

  async updatePencilHold(id, updateData, userId) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    // Check if user owns the pencil hold or is admin
    if (pencilHold.user.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this pencil hold');
    }

    // Don't allow updating if expired or cancelled
    if (pencilHold.status === 'expired' || pencilHold.status === 'cancelled') {
      throw new Error('Cannot update expired or cancelled pencil hold');
    }

    const updatedPencilHold = await PencilHold.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('event', 'title startDate location')
      .populate('user', 'name email');

    return updatedPencilHold;
  }

  async deletePencilHold(id, userId) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    // Check if user owns the pencil hold or is admin
    if (pencilHold.user.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this pencil hold');
    }

    await PencilHold.findByIdAndDelete(id);
    return { success: true };
  }

  async getUserPencilHolds(userId, { page = 1, limit = 10, status }) {
    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    const pencilHolds = await PencilHold.find(query)
      .populate('event', 'title startDate location capacity registrationCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PencilHold.countDocuments(query);

    return {
      pencilHolds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizerPencilHolds(organizerId, { page = 1, limit = 10, status }) {
    // Get events created by the organizer first
    const organizerEvents = await Event.find({ createdBy: organizerId }).select(
      '_id'
    );
    const eventIds = organizerEvents.map(event => event._id);

    if (eventIds.length === 0) {
      return {
        pencilHolds: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }

    // Get pencil holds for events created by the organizer
    const query = { event: { $in: eventIds } };

    if (status) {
      query.status = status;
    }

    const pencilHolds = await PencilHold.find(query)
      .populate(
        'event',
        'title startDate location capacity registrationCount createdBy'
      )
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PencilHold.countDocuments(query);

    return {
      pencilHolds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async confirmPencilHold(id) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    if (pencilHold.status !== 'pending') {
      throw new Error('Only pending pencil holds can be confirmed');
    }

    if (pencilHold.isExpired) {
      throw new Error('Cannot confirm expired pencil hold');
    }

    // Check if event still has capacity
    const event = await Event.findById(pencilHold.event);
    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is at full capacity');
    }

    await pencilHold.confirm();
    return await this.getPencilHoldById(id);
  }

  async confirmPencilHoldByOrganizer(id, userId) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    // Check if user owns the pencil hold
    if (pencilHold.user.toString() !== userId.toString()) {
      throw new Error('Not authorized to confirm this pencil hold');
    }

    if (pencilHold.status !== 'pending') {
      throw new Error('Only pending pencil holds can be confirmed');
    }

    if (pencilHold.isExpired) {
      throw new Error('Cannot confirm expired pencil hold');
    }

    // Check if event still has capacity
    const event = await Event.findById(pencilHold.event);
    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is at full capacity');
    }

    await pencilHold.confirm();

    // Update event status to pencil_hold_confirmed
    event.status = 'pencil_hold_confirmed';
    event.pencilHoldInfo.priority = pencilHold.priority;
    await event.save();

    return await this.getPencilHoldById(id);
  }

  async cancelPencilHold(id, reason) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    if (pencilHold.status === 'cancelled') {
      throw new Error('Pencil hold is already cancelled');
    }

    await pencilHold.cancel(reason);
    return await this.getPencilHoldById(id);
  }

  async getPendingPencilHolds() {
    return await PencilHold.findPending()
      .populate('event', 'title startDate location capacity registrationCount')
      .populate('user', 'name email');
  }

  async getExpiredPencilHolds() {
    return await PencilHold.findExpired()
      .populate('event', 'title startDate location')
      .populate('user', 'name email');
  }

  async extendPencilHold(id, days = 7) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    if (pencilHold.status !== 'pending') {
      throw new Error('Only pending pencil holds can be extended');
    }

    await pencilHold.extendExpiration(days);
    return await this.getPencilHoldById(id);
  }

  async approvePencilHold(id) {
    const pencilHold = await PencilHold.findById(id);

    if (!pencilHold) {
      throw new Error('Pencil hold not found');
    }

    if (pencilHold.status !== 'confirmed') {
      throw new Error('Only confirmed pencil holds can be approved');
    }

    // Get the event and update its status to published
    const event = await Event.findById(pencilHold.event);
    if (!event) {
      throw new Error('Associated event not found');
    }

    // Update event status to published
    event.status = 'published';
    event.approvedBy = pencilHold.user; // The organizer who created it
    event.approvedAt = new Date();
    // Clear pencil hold info since event is now published
    event.pencilHoldInfo = undefined;
    await event.save();

    // Mark pencil hold as converted
    pencilHold.status = 'converted';
    pencilHold.approvedBy = pencilHold.user;
    pencilHold.approvedAt = new Date();
    await pencilHold.save();

    return await this.getPencilHoldById(id);
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

  async handleExpiredPencilHolds() {
    // Find expired pencil holds
    const expiredHolds = await PencilHold.findExpired();

    for (const hold of expiredHolds) {
      // Update pencil hold status
      hold.status = 'expired';
      await hold.save();

      // Update event status back to draft
      const event = await Event.findById(hold.event);
      if (event && event.status === 'pencil_hold') {
        event.status = 'draft';
        event.pencilHoldInfo = undefined;
        await event.save();
      }
    }

    return expiredHolds.length;
  }
}

export const pencilHoldService = new PencilHoldService();
