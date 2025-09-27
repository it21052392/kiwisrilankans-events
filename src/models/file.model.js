import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    uploadType: {
      type: String,
      enum: ['event_image', 'avatar', 'banner', 'general'],
      default: 'general',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Bucket: {
      type: String,
      required: true,
    },
    dimensions: {
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
fileSchema.index({ uploadedBy: 1, uploadType: 1 });
fileSchema.index({ s3Key: 1 });
fileSchema.index({ url: 1 });
fileSchema.index({ isActive: 1 });

// Virtual for file extension
fileSchema.virtual('extension').get(function () {
  return this.originalName.split('.').pop()?.toLowerCase() || '';
});

// Virtual for file size in human readable format
fileSchema.virtual('sizeFormatted').get(function () {
  if (this.size === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.size) / Math.log(k));

  return parseFloat((this.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if file is an image
fileSchema.methods.isImage = function () {
  return this.type.startsWith('image/');
};

// Method to get thumbnail URL (if supported)
fileSchema.methods.getThumbnailUrl = function (_size = 'medium') {
  // This would depend on your S3 setup and whether you generate thumbnails
  // For now, return the original URL
  return this.url;
};

// Static method to find files by upload type
fileSchema.statics.findByUploadType = function (
  uploadType,
  userId,
  options = {}
) {
  const query = { uploadType, uploadedBy: userId, isActive: true };
  return this.find(query, null, options);
};

// Static method to find files by S3 key
fileSchema.statics.findByS3Key = function (s3Key) {
  return this.findOne({ s3Key, isActive: true });
};

// Static method to soft delete file
fileSchema.statics.softDelete = function (fileId, userId) {
  return this.findOneAndUpdate(
    { _id: fileId, uploadedBy: userId },
    { isActive: false },
    { new: true }
  );
};

// Static method to hard delete file (permanently remove from database)
fileSchema.statics.hardDelete = function (fileId, userId) {
  return this.findOneAndDelete({
    _id: fileId,
    uploadedBy: userId,
  });
};

// Static method to cleanup orphaned files
fileSchema.statics.findOrphanedFiles = function (olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return this.find({
    isActive: true,
    createdAt: { $lt: cutoffDate },
    // Add additional criteria to identify orphaned files
    // This would depend on your business logic
  });
};

const File = mongoose.model('File', fileSchema);

export default File;
