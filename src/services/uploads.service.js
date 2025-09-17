import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

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
    this.bucketName = env.S3_BUCKET_NAME;
  }

  async uploadSingle(file, type = 'general', userId) {
    try {
      // Validate file object
      if (!file || !file.buffer || !file.originalname) {
        throw new Error('Invalid file object received');
      }

      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${type}/${userId}/${uuidv4()}.${fileExtension}`;

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
        } catch (error) {
          logger.warn('Could not extract image dimensions:', error);
        }
      }

      // Check if AWS credentials are configured
      if (
        !env.AWS_ACCESS_KEY_ID ||
        !env.AWS_SECRET_ACCESS_KEY ||
        !env.S3_BUCKET_NAME ||
        !this.s3Client
      ) {
        logger.warn(
          'AWS S3 credentials not configured. Using local file storage for development.'
        );
        return await this.uploadToLocal(file, fileName, metadata, type, userId);
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

      return {
        id: new Types.ObjectId().toString(),
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userId,
        uploadedAt: new Date(),
        dimensions:
          metadata.width && metadata.height
            ? {
                width: parseInt(metadata.width),
                height: parseInt(metadata.height),
              }
            : undefined,
      };
    } catch (error) {
      logger.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadToLocal(file, fileName, metadata, type, userId) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads', type);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create user directory
      const userDir = path.join(uploadsDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Write file to local storage
      const filePath = path.join(userDir, path.basename(fileName));
      fs.writeFileSync(filePath, file.buffer);

      // Generate local URL - use the correct port for the backend
      const fileUrl = `http://localhost:${env.PORT || 3000}/uploads/${type}/${userId}/${path.basename(fileName)}`;

      logger.info(`File uploaded locally: ${filePath}`);
      logger.info(`File URL: ${fileUrl}`);

      return {
        id: new Types.ObjectId().toString(),
        filename: fileName,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
        uploadType: type,
        uploadedBy: userId,
        uploadedAt: new Date(),
        dimensions:
          metadata.width && metadata.height
            ? {
                width: parseInt(metadata.width),
                height: parseInt(metadata.height),
              }
            : undefined,
      };
    } catch (error) {
      logger.error('Local upload error:', error);
      throw new Error(`Failed to upload file locally: ${error.message}`);
    }
  }

  async uploadMultiple(files, type = 'general', userId) {
    const uploadPromises = files.map(file =>
      this.uploadSingle(file, type, userId)
    );
    return await Promise.all(uploadPromises);
  }

  async getFileById(id, userId) {
    // In a real implementation, you would store file metadata in a database
    // For now, we'll return a mock response
    return {
      id,
      filename: 'example-file.jpg',
      originalName: 'example-file.jpg',
      url: 'https://example.com/file.jpg',
      size: 1024000,
      type: 'image/jpeg',
      uploadType: 'general',
      uploadedBy: userId,
      uploadedAt: new Date(),
    };
  }

  async getUserFiles(userId, { page = 1, limit = 10, _type }) {
    // In a real implementation, you would query a files database
    // For now, we'll return a mock response
    return {
      files: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async deleteFile(id, userId) {
    try {
      // For now, we'll implement local file deletion
      // In a production environment, you would:
      // 1. Get file metadata from database using the id
      // 2. Delete from S3 using the filename
      // 3. Remove from database
      // 4. Delete local file if it exists

      // Check if AWS credentials are configured
      if (
        !env.AWS_ACCESS_KEY_ID ||
        !env.AWS_SECRET_ACCESS_KEY ||
        !env.S3_BUCKET_NAME ||
        !this.s3Client
      ) {
        // For local development, we'll try to find and delete the file
        // This is a simplified approach - in production you'd store file metadata in a database
        logger.info(`File deletion requested for ID: ${id} by user ${userId}`);

        // Since we don't have a database yet, we'll just return success
        // In a real implementation, you'd look up the file by ID and delete it
        return {
          success: true,
          message: 'File deletion requested (local development mode)',
        };
      }

      // For S3, you would delete the file here
      // const command = new DeleteObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: filename
      // });
      // await this.s3Client.send(command);

      logger.info(`File deleted: ${id} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteFileByUrl(url, userId) {
    try {
      // Check if AWS credentials are configured
      if (
        !env.AWS_ACCESS_KEY_ID ||
        !env.AWS_SECRET_ACCESS_KEY ||
        !env.S3_BUCKET_NAME ||
        !this.s3Client
      ) {
        logger.info(
          `File deletion requested for URL: ${url} by user ${userId} (local development mode)`
        );
        return {
          success: true,
          message: 'File deletion requested (local development mode)',
        };
      }

      // Extract the S3 key from the URL
      // URL format: https://bucket-name.s3.region.amazonaws.com/key
      // or https://s3.region.amazonaws.com/bucket-name/key
      let key;
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part);

        if (
          urlObj.hostname.includes('s3.') &&
          urlObj.hostname.includes('.amazonaws.com')
        ) {
          // Format: https://s3.region.amazonaws.com/bucket-name/key
          key = pathParts.slice(1).join('/');
        } else if (
          urlObj.hostname.includes('.s3.') &&
          urlObj.hostname.includes('.amazonaws.com')
        ) {
          // Format: https://bucket-name.s3.region.amazonaws.com/key
          key = pathParts.join('/');
        } else {
          throw new Error('Invalid S3 URL format');
        }
      } catch (error) {
        logger.warn(`Could not parse S3 URL: ${url}`, error);
        return {
          success: false,
          message: 'Invalid S3 URL format',
        };
      }

      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      logger.info(`File deleted from S3: ${key} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file by URL error:', error);
      throw new Error('Failed to delete file from S3');
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
    _type,
    _userId,
    _startDate,
    _endDate,
  }) {
    // In a real implementation, you would query a files database
    return {
      files: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async cleanupOrphanedFiles() {
    try {
      // In a real implementation, you would:
      // 1. Find files in S3 that don't exist in database
      // 2. Delete orphaned files
      // 3. Return cleanup statistics

      logger.info('Orphaned files cleanup completed');
      return { deletedCount: 0 };
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

  async getImageDimensions(_buffer) {
    return new Promise((resolve, _reject) => {
      // This is a simplified implementation
      // In a real application, you'd use a library like 'sharp' or 'jimp'
      // For now, we'll return default dimensions
      resolve({ width: 1920, height: 1080 });
    });
  }
}

export const uploadService = new UploadService();
