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
    const { eventId, userId, ...otherData } = pencilHoldData;

    // Check if event exists and is available
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'published') {
      throw new Error('Event is not available for pencil holds');
    }

    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is at full capacity');
    }

    // Check if user already has a pencil hold for this event
    const existingHold = await PencilHold.findOne({
      event: eventId,
      user: userId,
    });

    if (existingHold) {
      throw new Error('User already has a pencil hold for this event');
    }

    // Check if user is already registered
    const isRegistered = event.registrations.some(
      reg => reg.user.toString() === userId.toString()
    );

    if (isRegistered) {
      throw new Error('User is already registered for this event');
    }

    const pencilHold = await PencilHold.create({
      event: eventId,
      user: userId,
      ...otherData,
    });

    return await this.getPencilHoldById(pencilHold._id);
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
}

export const pencilHoldService = new PencilHoldService();
