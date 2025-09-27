import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import File from '../models/file.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadService {
  constructor() {
    // Only initialize S3 client if credentials are available
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION) {
      this.s3Client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      this.s3Client = null;
    }
    this.bucketName = env.AWS_S3_BUCKET_NAME;
  }

  async uploadSingle(file, type = 'general', userId) {
    try {
      // Validate file object
      if (!file || !file.buffer || !file.originalname) {
        throw new Error('Invalid file object received');
      }

      // Convert userId to string if it's an ObjectId
      const userIdStr = userId?.toString() || 'unknown';
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${type}/${userIdStr}/${uuidv4()}.${fileExtension}`;

      // Add image-specific metadata for event images
      const metadata = {
        originalName: String(file.originalname || ''),
        uploadedBy: String(userId || ''),
        uploadType: String(type || 'general'),
        uploadedAt: new Date().toISOString(),
      };

      // Add image dimensions if it's an image file
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        try {
          const dimensions = await this.getImageDimensions(file.buffer);
          metadata.width = String(dimensions.width || 0);
          metadata.height = String(dimensions.height || 0);
          logger.info(
            `Image dimensions extracted: ${dimensions.width}x${dimensions.height}`
          );
        } catch (error) {
          logger.warn('Could not extract image dimensions:', error.message);
          // Don't fail the upload if we can't read dimensions
          // Just log the warning and continue
          metadata.width = '0';
          metadata.height = '0';
        }
      }

      // Check if AWS credentials are configured
      if (
        !env.AWS_ACCESS_KEY_ID ||
        !env.AWS_SECRET_ACCESS_KEY ||
        !env.AWS_S3_BUCKET_NAME ||
        !this.s3Client
      ) {
        logger.warn(
          'AWS S3 credentials not configured. Using local file storage for development.'
        );
        return await this.uploadToLocal(
          file,
          fileName,
          metadata,
          type,
          userIdStr
        );
      }

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: metadata,
        // Add cache control for better performance
        CacheControl: 'public, max-age=31536000', // 1 year
      };

      logger.info('S3 Upload params:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        Metadata: uploadParams.Metadata,
      });

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

      // Save file metadata to database
      const fileRecord = new File({
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userId,
        s3Key: fileName,
        s3Bucket: this.bucketName,
        dimensions:
          metadata.width && metadata.height
            ? {
                width: parseInt(metadata.width),
                height: parseInt(metadata.height),
              }
            : { width: 0, height: 0 },
        metadata: metadata,
      });

      await fileRecord.save();

      return {
        id: fileRecord._id.toString(),
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userId,
        uploadedAt: fileRecord.createdAt,
        dimensions: fileRecord.dimensions,
      };
    } catch (error) {
      logger.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadToLocal(file, fileName, metadata, type, userIdStr) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads', type);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create user directory
      const userDir = path.join(uploadsDir, userIdStr);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Write file to local storage
      const filePath = path.join(userDir, path.basename(fileName));
      fs.writeFileSync(filePath, file.buffer);

      // Generate local URL - use the correct host and port
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? env.CORS_ORIGIN
            ? env.CORS_ORIGIN.split(',')[0].replace(':5000', ':3000')
            : `http://localhost:${env.PORT || 3000}`
          : `http://localhost:${env.PORT || 3000}`;
      const fileUrl = `${baseUrl}/uploads/${type}/${userIdStr}/${path.basename(fileName)}`;

      logger.info(`File uploaded locally: ${filePath}`);
      logger.info(`File URL: ${fileUrl}`);

      // Save file metadata to database even for local uploads
      const fileRecord = new File({
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userIdStr,
        s3Key: fileName, // For local files, use filename as key
        s3Bucket: 'local', // Mark as local storage
        dimensions:
          metadata.width && metadata.height
            ? {
                width: parseInt(metadata.width),
                height: parseInt(metadata.height),
              }
            : { width: 0, height: 0 },
        metadata: metadata,
      });

      await fileRecord.save();

      return {
        id: fileRecord._id.toString(),
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userIdStr,
        uploadedAt: fileRecord.createdAt,
        dimensions: fileRecord.dimensions,
      };
    } catch (error) {
      logger.error('Local upload error:', error);
      throw new Error(`Failed to upload file locally: ${error.message}`);
    }
  }

  async uploadMultiple(files, type = 'general', userId) {
    // Convert userId to string if it's an ObjectId
    const userIdStr = userId?.toString() || 'unknown';
    const uploadPromises = files.map(file =>
      this.uploadSingle(file, type, userIdStr)
    );
    return await Promise.all(uploadPromises);
  }

  async getFileById(id, userId) {
    try {
      const file = await File.findOne({
        _id: id,
        uploadedBy: userId,
        isActive: true,
      });

      if (!file) {
        throw new Error('File not found');
      }

      return {
        id: file._id.toString(),
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        type: file.type,
        uploadType: file.uploadType,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt,
        dimensions: file.dimensions,
      };
    } catch (error) {
      logger.error('Get file by ID error:', error);
      throw new Error('Failed to get file');
    }
  }

  async getUserFiles(userId, { page = 1, limit = 10, type }) {
    try {
      const query = {
        uploadedBy: userId,
        isActive: true,
      };

      if (type) {
        query.uploadType = type;
      }

      const skip = (page - 1) * limit;

      const [files, total] = await Promise.all([
        File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        File.countDocuments(query),
      ]);

      const formattedFiles = files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        type: file.type,
        uploadType: file.uploadType,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt,
        dimensions: file.dimensions,
      }));

      return {
        files: formattedFiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get user files error:', error);
      throw new Error('Failed to get user files');
    }
  }

  async deleteFile(id, userId) {
    try {
      // Get file metadata from database
      const file = await File.findOne({
        _id: id,
        uploadedBy: userId,
        isActive: true,
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from S3 if it's not a local file
      if (file.s3Bucket !== 'local' && this.s3Client) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: file.s3Bucket,
            Key: file.s3Key,
          });
          await this.s3Client.send(command);
          logger.info(`File deleted from S3: ${file.s3Key}`);
        } catch (s3Error) {
          logger.warn(`Failed to delete file from S3: ${file.s3Key}`, s3Error);
          // Continue with database deletion even if S3 deletion fails
        }
      } else if (file.s3Bucket === 'local') {
        // Delete local file
        try {
          const filePath = path.join(__dirname, '../../uploads', file.s3Key);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Local file deleted: ${filePath}`);
          }
        } catch (localError) {
          logger.warn(`Failed to delete local file: ${file.s3Key}`, localError);
          // Continue with database deletion even if local file deletion fails
        }
      }

      // Soft delete from database
      await File.softDelete(id, userId);

      logger.info(`File deleted: ${id} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteFileByUrl(url, userId) {
    try {
      // Find file by URL in database
      const file = await File.findOne({
        url: url,
        uploadedBy: userId,
        isActive: true,
      });

      if (!file) {
        logger.warn(`File not found in database for URL: ${url}`);
        return {
          success: false,
          message: 'File not found in database',
        };
      }

      // Delete from S3 if it's not a local file
      if (file.s3Bucket !== 'local' && this.s3Client) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: file.s3Bucket,
            Key: file.s3Key,
          });
          await this.s3Client.send(command);
          logger.info(`File deleted from S3: ${file.s3Key}`);
        } catch (s3Error) {
          logger.warn(`Failed to delete file from S3: ${file.s3Key}`, s3Error);
          // Continue with database deletion even if S3 deletion fails
        }
      } else if (file.s3Bucket === 'local') {
        // Delete local file
        try {
          const filePath = path.join(__dirname, '../../uploads', file.s3Key);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Local file deleted: ${filePath}`);
          }
        } catch (localError) {
          logger.warn(`Failed to delete local file: ${file.s3Key}`, localError);
          // Continue with database deletion even if local file deletion fails
        }
      }

      // Soft delete from database
      await File.softDelete(file._id, userId);

      logger.info(`File deleted by URL: ${url} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file by URL error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async hardDeleteFileByUrl(url, userId) {
    try {
      // Find file by URL in database
      const file = await File.findOne({
        url: url,
        uploadedBy: userId,
        isActive: true,
      });

      if (!file) {
        logger.warn(`File not found in database for URL: ${url}`);
        return {
          success: false,
          message: 'File not found in database',
        };
      }

      // Delete from S3 if it's not a local file
      if (file.s3Bucket !== 'local' && this.s3Client) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: file.s3Bucket,
            Key: file.s3Key,
          });
          await this.s3Client.send(command);
          logger.info(`File hard deleted from S3: ${file.s3Key}`);
        } catch (s3Error) {
          logger.warn(`Failed to delete file from S3: ${file.s3Key}`, s3Error);
          // Continue with database deletion even if S3 deletion fails
        }
      } else if (file.s3Bucket === 'local') {
        // Delete local file
        try {
          const filePath = path.join(__dirname, '../../uploads', file.s3Key);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Local file hard deleted: ${filePath}`);
          }
        } catch (localError) {
          logger.warn(`Failed to delete local file: ${file.s3Key}`, localError);
          // Continue with database deletion even if local file deletion fails
        }
      }

      // Hard delete from database (permanently remove)
      await File.hardDelete(file._id, userId);

      logger.info(`File hard deleted by URL: ${url} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Hard delete file by URL error:', error);
      throw new Error('Failed to hard delete file from S3');
    }
  }

  async deleteMultipleFilesByUrls(urls, userId) {
    try {
      const results = [];

      for (const url of urls) {
        try {
          const result = await this.deleteFileByUrl(url, userId);
          results.push({
            url,
            success: result.success,
            message: result.message,
          });
        } catch (error) {
          logger.error(`Failed to delete file: ${url}`, error);
          results.push({ url, success: false, message: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info(
        `Bulk delete completed: ${successCount} successful, ${failureCount} failed`
      );

      return {
        success: failureCount === 0,
        results,
        summary: {
          total: urls.length,
          successful: successCount,
          failed: failureCount,
        },
      };
    } catch (error) {
      logger.error('Bulk delete files error:', error);
      throw new Error('Failed to delete multiple files');
    }
  }

  async hardDeleteMultipleFilesByUrls(urls, userId) {
    try {
      const results = [];

      for (const url of urls) {
        try {
          const result = await this.hardDeleteFileByUrl(url, userId);
          results.push({
            url,
            success: result.success,
            message: result.message,
          });
        } catch (error) {
          logger.error(`Failed to hard delete file: ${url}`, error);
          results.push({ url, success: false, message: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info(
        `Bulk hard delete completed: ${successCount} successful, ${failureCount} failed`
      );

      return {
        success: failureCount === 0,
        results,
        summary: {
          total: urls.length,
          successful: successCount,
          failed: failureCount,
        },
      };
    } catch (error) {
      logger.error('Bulk hard delete files error:', error);
      throw new Error('Failed to hard delete multiple files');
    }
  }

  async getDownloadUrl(id, _userId) {
    try {
      // In a real implementation, you would:
      // 1. Get file metadata from database
      // 2. Generate signed URL for download

      const downloadUrl = `https://example.com/download/${id}`;
      return { downloadUrl };
    } catch (error) {
      logger.error('Get download URL error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  async getAllFiles({
    page = 1,
    limit = 10,
    type,
    userId,
    startDate,
    endDate,
  }) {
    try {
      const query = { isActive: true };

      if (type) {
        query.uploadType = type;
      }

      if (userId) {
        query.uploadedBy = userId;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [files, total] = await Promise.all([
        File.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('uploadedBy', 'name email')
          .lean(),
        File.countDocuments(query),
      ]);

      const formattedFiles = files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        type: file.type,
        uploadType: file.uploadType,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt,
        dimensions: file.dimensions,
      }));

      return {
        files: formattedFiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all files error:', error);
      throw new Error('Failed to get all files');
    }
  }

  async cleanupOrphanedFiles() {
    try {
      // Find files that are marked as inactive (soft deleted) but still exist in S3
      const orphanedFiles = await File.find({
        isActive: false,
        s3Bucket: { $ne: 'local' },
      });

      let deletedCount = 0;
      const results = [];

      for (const file of orphanedFiles) {
        try {
          if (this.s3Client) {
            const command = new DeleteObjectCommand({
              Bucket: file.s3Bucket,
              Key: file.s3Key,
            });
            await this.s3Client.send(command);
            deletedCount++;
            results.push({
              fileId: file._id.toString(),
              s3Key: file.s3Key,
              success: true,
            });
          }
        } catch (error) {
          logger.warn(`Failed to delete orphaned file: ${file.s3Key}`, error);
          results.push({
            fileId: file._id.toString(),
            s3Key: file.s3Key,
            success: false,
            error: error.message,
          });
        }
      }

      logger.info(
        `Orphaned files cleanup completed: ${deletedCount} files deleted`
      );
      return {
        deletedCount,
        results,
        totalProcessed: orphanedFiles.length,
      };
    } catch (error) {
      logger.error('Cleanup error:', error);
      throw new Error('Failed to cleanup orphaned files');
    }
  }

  async cleanupEventImages(eventId) {
    try {
      // Find the event to get its image URLs
      const { Event } = await import('../models/event.model.js');
      const event = await Event.findById(eventId);

      if (!event || !event.images || event.images.length === 0) {
        return {
          success: true,
          message: 'No images to clean up',
          deletedCount: 0,
        };
      }

      const imageUrls = event.images.map(img => img.url);
      const deleteResult = await this.deleteMultipleFilesByUrls(
        imageUrls,
        event.createdBy
      );

      return {
        success: deleteResult.success,
        message: `Cleanup completed: ${deleteResult.summary.successful}/${deleteResult.summary.total} images deleted`,
        deletedCount: deleteResult.summary.successful,
        results: deleteResult.results,
      };
    } catch (error) {
      logger.error(`Error cleaning up images for event ${eventId}:`, error);
      throw new Error(`Failed to cleanup event images: ${error.message}`);
    }
  }

  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      logger.error('Generate signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async validateFileType(file, allowedTypes) {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  async validateFileSize(file, maxSize) {
    return file.size <= maxSize;
  }

  async getFileMetadata(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      logger.error('Get file metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  async getImageDimensions(buffer) {
    try {
      if (!buffer || buffer.length === 0) {
        throw new Error('Empty buffer provided');
      }

      const metadata = await sharp(buffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not extract dimensions from image');
      }

      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      logger.warn('Failed to get image dimensions:', error.message);
      throw new Error(`Failed to read image dimensions: ${error.message}`);
    }
  }
}

export const uploadService = new UploadService();
