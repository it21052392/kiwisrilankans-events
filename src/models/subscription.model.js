import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['email', 'push', 'sms', 'all'],
      required: [true, 'Subscription type is required'],
    },
    preferences: {
      eventReminders: {
        type: Boolean,
        default: true,
      },
      eventUpdates: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: true,
      },
      newEvents: {
        type: Boolean,
        default: true,
      },
      categorySpecific: [
        {
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
          },
          enabled: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
    },
    // For push notifications
    pushSubscription: {
      endpoint: {
        type: String,
        required: function () {
          return this.type === 'push' || this.type === 'all';
        },
      },
      keys: {
        p256dh: {
          type: String,
          required: function () {
            return this.type === 'push' || this.type === 'all';
          },
        },
        auth: {
          type: String,
          required: function () {
            return this.type === 'push' || this.type === 'all';
          },
        },
      },
    },
    // For email subscriptions
    emailAddress: {
      type: String,
      required: function () {
        return this.type === 'email' || this.type === 'all';
      },
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    // For SMS subscriptions
    phoneNumber: {
      type: String,
      required: function () {
        return this.type === 'sms' || this.type === 'all';
      },
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    // Subscription metadata
    lastSent: {
      type: Date,
      default: null,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    // Unsubscribe token for email
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ type: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ emailAddress: 1 });
subscriptionSchema.index({ phoneNumber: 1 });
subscriptionSchema.index({ unsubscribeToken: 1 });
subscriptionSchema.index({ verificationToken: 1 });

// Compound indexes
subscriptionSchema.index({ user: 1, type: 1 });
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ type: 1, status: 1 });
subscriptionSchema.index({ status: 1, isVerified: 1 });

// Pre-save middleware to generate unsubscribe token
subscriptionSchema.pre('save', function (next) {
  if (
    (this.type === 'email' || this.type === 'all') &&
    !this.unsubscribeToken
  ) {
    this.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Pre-save middleware to generate verification token
subscriptionSchema.pre('save', function (next) {
  if (!this.isVerified && !this.verificationToken) {
    this.verificationToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Virtual for is active
subscriptionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && this.isVerified;
});

// Virtual for can receive notifications
subscriptionSchema.virtual('canReceiveNotifications').get(function () {
  return this.status === 'active' && this.isVerified && this.failedCount < 5;
});

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function () {
  return this.find({
    status: 'active',
    isVerified: true,
    failedCount: { $lt: 5 },
  });
};

// Static method to find by type
subscriptionSchema.statics.findByType = function (type) {
  return this.find({
    type: { $in: [type, 'all'] },
    status: 'active',
    isVerified: true,
  });
};

// Static method to find by user
subscriptionSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId });
};

// Static method to find email subscriptions
subscriptionSchema.statics.findEmailSubscriptions = function () {
  return this.find({
    type: { $in: ['email', 'all'] },
    status: 'active',
    isVerified: true,
    emailAddress: { $exists: true },
  });
};

// Static method to find push subscriptions
subscriptionSchema.statics.findPushSubscriptions = function () {
  return this.find({
    type: { $in: ['push', 'all'] },
    status: 'active',
    isVerified: true,
    'pushSubscription.endpoint': { $exists: true },
  });
};

// Static method to find by unsubscribe token
subscriptionSchema.statics.findByUnsubscribeToken = function (token) {
  return this.findOne({ unsubscribeToken: token });
};

// Static method to find by verification token
subscriptionSchema.statics.findByVerificationToken = function (token) {
  return this.findOne({ verificationToken: token });
};

// Instance method to verify subscription
subscriptionSchema.methods.verify = function () {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verificationToken = undefined;
  return this.save();
};

// Instance method to pause subscription
subscriptionSchema.methods.pause = function () {
  this.status = 'paused';
  return this.save();
};

// Instance method to resume subscription
subscriptionSchema.methods.resume = function () {
  this.status = 'active';
  return this.save();
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function () {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to record successful send
subscriptionSchema.methods.recordSuccess = function () {
  this.lastSent = new Date();
  this.sentCount += 1;
  this.failedCount = 0; // Reset failed count on success
  this.lastError = null;
  return this.save();
};

// Instance method to record failed send
subscriptionSchema.methods.recordFailure = function (error) {
  this.failedCount += 1;
  this.lastError = error.message || error;
  return this.save();
};

// Instance method to update preferences
subscriptionSchema.methods.updatePreferences = function (newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  return this.save();
};

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
