import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Event category is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    registrationDeadline: {
      type: Date,
      required: false,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return value <= this.startDate;
        },
        message: 'Registration deadline must be before or on start date',
      },
    },
    location: {
      name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
        maxlength: [100, 'Location name cannot exceed 100 characters'],
      },
      address: {
        type: String,
        required: [true, 'Location address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [50, 'City cannot exceed 50 characters'],
      },
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [10000, 'Capacity cannot exceed 10000'],
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'NZD',
      enum: ['NZD', 'USD', 'AUD', 'EUR', 'GBP'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: '',
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        'draft',
        'pencil_hold',
        'pencil_hold_confirmed',
        'pending_approval',
        'published',
        'rejected',
        'unpublished',
        'cancelled',
        'completed',
        'deleted',
      ],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters'],
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Requirement cannot exceed 100 characters'],
      },
    ],
    contactInfo: {
      name: {
        type: String,
        trim: true,
        maxlength: [50, 'Contact name cannot exceed 50 characters'],
      },
      email: {
        type: String,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please enter a valid email',
        ],
      },
      phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone cannot exceed 20 characters'],
      },
    },
    registrationCount: {
      type: Number,
      default: 0,
    },
    pencilHoldCount: {
      type: Number,
      default: 0,
    },
    pencilHoldInfo: {
      pencilHoldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PencilHold',
      },
      expiresAt: {
        type: Date,
      },
      notes: {
        type: String,
        maxlength: [500, 'Pencil hold notes cannot exceed 500 characters'],
      },
      priority: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    unpublishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unpublishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
eventSchema.index({ title: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ isDeleted: 1 });
eventSchema.index({ deletedAt: 1 });

// Compound indexes
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ featured: 1, status: 1 });

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.registrationCount;
});

// Virtual for registration status
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    this.status === 'published' &&
    (!this.registrationDeadline || this.registrationDeadline > now) &&
    this.availableSpots > 0
  );
});

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function () {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'completed') return 'completed';
  if (now < this.startDate) return 'upcoming';
  if (now >= this.startDate && now <= this.endDate) return 'ongoing';
  return 'completed';
});

// Pre-save middleware to generate slug
eventSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to validate dates
eventSchema.pre('save', function (next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.registrationDeadline && this.registrationDeadline > this.startDate) {
    return next(
      new Error('Registration deadline must be before or on start date')
    );
  }
  next();
});

// Static method to find published events
eventSchema.statics.findPublished = function () {
  return this.find({ status: 'published', isDeleted: false });
};

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function () {
  return this.find({
    status: 'published',
    isDeleted: false,
    startDate: { $gt: new Date() },
  });
};

// Static method to find by slug
eventSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isDeleted: false });
};

// Static method to find events by category
eventSchema.statics.findByCategory = function (categoryId) {
  return this.find({
    category: categoryId,
    status: 'published',
    isDeleted: false,
  });
};

// Static method to search events
eventSchema.statics.search = function (query) {
  return this.find({
    status: 'published',
    isDeleted: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ],
  });
};

// Instance method to soft delete event
eventSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'deleted';
  return this.save();
};

// Instance method to restore event
eventSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.status = 'draft';
  return this.save();
};

// Static method to find all events including deleted (for admin)
eventSchema.statics.findAllIncludingDeleted = function (query = {}) {
  return this.find(query);
};

// Static method to find only deleted events
eventSchema.statics.findDeleted = function () {
  return this.find({ isDeleted: true });
};

export const Event = mongoose.model('Event', eventSchema);
