import mongoose from 'mongoose';

const adminWhitelistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
adminWhitelistSchema.index({ email: 1 });
adminWhitelistSchema.index({ isActive: 1 });

// Static method to check if email is whitelisted
adminWhitelistSchema.statics.isEmailWhitelisted = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
};

// Static method to add email to whitelist
adminWhitelistSchema.statics.addEmail = function (email, addedBy) {
  return this.create({
    email: email.toLowerCase(),
    addedBy,
  });
};

// Static method to remove email from whitelist
adminWhitelistSchema.statics.removeEmail = function (email) {
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isActive: false },
    { new: true }
  );
};

export const AdminWhitelist = mongoose.model(
  'AdminWhitelist',
  adminWhitelistSchema
);
