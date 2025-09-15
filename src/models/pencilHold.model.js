import mongoose from 'mongoose';

const pencilHoldSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'converted', 'cancelled', 'expired'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    additionalInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      default: function () {
        // Default to 48 hours from now
        return new Date(Date.now() + 48 * 60 * 60 * 1000);
      },
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Cancellation reason cannot exceed 200 characters'],
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
pencilHoldSchema.index({ event: 1 });
pencilHoldSchema.index({ user: 1 });
pencilHoldSchema.index({ status: 1 });
pencilHoldSchema.index({ expiresAt: 1 });
pencilHoldSchema.index({ priority: -1 });
pencilHoldSchema.index({ createdAt: -1 });

// Compound indexes
pencilHoldSchema.index({ event: 1, user: 1 }, { unique: true });
pencilHoldSchema.index({ event: 1, status: 1 });
pencilHoldSchema.index({ user: 1, status: 1 });
pencilHoldSchema.index({ status: 1, expiresAt: 1 });

// Virtual for is expired
pencilHoldSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

// Virtual for days until expiration
pencilHoldSchema.virtual('daysUntilExpiration').get(function () {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate expiration date
pencilHoldSchema.pre('save', function (next) {
  if (this.isModified('expiresAt') && this.expiresAt <= new Date()) {
    return next(new Error('Expiration date must be in the future'));
  }
  next();
});

// Pre-save middleware to update status based on expiration
pencilHoldSchema.pre('save', function (next) {
  if (this.isExpired && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

// Pre-save middleware to set timestamps
pencilHoldSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// Post-save middleware to update event pencil hold count
pencilHoldSchema.post('save', async function () {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  if (event) {
    const count = await mongoose.model('PencilHold').countDocuments({
      event: this.event,
      status: { $in: ['pending', 'confirmed'] },
    });
    event.pencilHoldCount = count;
    await event.save();
  }
});

// Post-remove middleware to update event pencil hold count
pencilHoldSchema.post('remove', async function () {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  if (event) {
    const count = await mongoose.model('PencilHold').countDocuments({
      event: this.event,
      status: { $in: ['pending', 'confirmed'] },
    });
    event.pencilHoldCount = count;
    await event.save();
  }
});

// Static method to find active pencil holds
pencilHoldSchema.statics.findActive = function () {
  return this.find({
    status: { $in: ['pending', 'confirmed'] },
    expiresAt: { $gt: new Date() },
  });
};

// Static method to find expired pencil holds
pencilHoldSchema.statics.findExpired = function () {
  return this.find({
    status: 'pending',
    expiresAt: { $lte: new Date() },
  });
};

// Static method to find by event
pencilHoldSchema.statics.findByEvent = function (eventId) {
  return this.find({ event: eventId }).populate('user', 'name email');
};

// Static method to find by user
pencilHoldSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).populate(
    'event',
    'title startDate location'
  );
};

// Static method to find pending pencil holds
pencilHoldSchema.statics.findPending = function () {
  return this.find({
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).sort({ priority: -1, createdAt: 1 });
};

// Instance method to confirm pencil hold
pencilHoldSchema.methods.confirm = function () {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

// Instance method to cancel pencil hold
pencilHoldSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Instance method to extend expiration
pencilHoldSchema.methods.extendExpiration = function (days = 7) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

// Instance method to convert pencil hold to event
pencilHoldSchema.methods.convert = function () {
  this.status = 'converted';
  return this.save();
};

export const PencilHold = mongoose.model('PencilHold', pencilHoldSchema);
