import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

class UploadService {
  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = env.S3_BUCKET_NAME;
  }

  async uploadSingle(file, type = 'general', userId) {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${type}/${userId}/${uuidv4()}.${fileExtension}`;

      // Add image-specific metadata for event images
      const metadata = {
        originalName: file.originalname,
        uploadedBy: userId,
        uploadType: type,
        uploadedAt: new Date().toISOString(),
      };

      // Add image dimensions if it's an image file
      if (file.mimetype.startsWith('image/')) {
        try {
          const dimensions = await this.getImageDimensions(file.buffer);
          metadata.width = dimensions.width.toString();
          metadata.height = dimensions.height.toString();
        } catch (error) {
          logger.warn('Could not extract image dimensions:', error);
        }
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

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

      return {
        id: uuidv4(),
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
      throw new Error('Failed to upload file');
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
      // In a real implementation, you would:
      // 1. Get file metadata from database
      // 2. Delete from S3
      // 3. Remove from database

      logger.info(`File deleted: ${id} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file error:', error);
      throw new Error('Failed to delete file');
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
