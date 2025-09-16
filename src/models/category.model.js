import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    },
    icon: {
      type: String,
      default: 'calendar',
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    eventCount: {
      type: Number,
      default: 0,
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
categorySchema.index({ name: 1 });
categorySchema.index({ active: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for events in this category
categorySchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'category',
});

// Pre-save middleware to update event count
categorySchema.pre('save', async function (next) {
  if (this.isModified('active') && !this.active) {
    // If category is being deactivated, update all events in this category
    await mongoose
      .model('Event')
      .updateMany({ category: this._id }, { $unset: { category: 1 } });
  }
  next();
});

// Post-save middleware to update event count
categorySchema.post('save', async function () {
  if (this.isModified('active')) {
    const Event = mongoose.model('Event');
    const eventCount = await Event.countDocuments({ category: this._id });
    this.eventCount = eventCount;
    await this.save();
  }
});

// Static method to find active categories
categorySchema.statics.findActive = function () {
  return this.find({ active: true }).sort({ sortOrder: 1, name: 1 });
};

// Instance method to update event count
categorySchema.methods.updateEventCount = async function () {
  const Event = mongoose.model('Event');
  const count = await Event.countDocuments({ category: this._id });
  this.eventCount = count;
  return this.save();
};

export const Category = mongoose.model('Category', categorySchema);
