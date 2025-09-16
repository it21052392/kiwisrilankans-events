import { apiClient } from '@/lib/api';

export interface ImageUploadResult {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadType: string;
  uploadedBy: string;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  generateThumbnail?: boolean;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ImageUploadService {
  private static readonly DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 4000,
    maxHeight: 4000,
    quality: 0.8,
    generateThumbnail: true,
  };

  /**
   * Validate image file before upload
   */
  static async validateImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<ImageValidationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file type
    if (!opts.allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > opts.maxSize) {
      errors.push(`File size too large. Maximum size: ${this.formatFileSize(opts.maxSize)}`);
    }

    // Check image dimensions
    try {
      const dimensions = await this.getImageDimensions(file);
      if (dimensions.width > opts.maxWidth) {
        errors.push(`Image width too large. Maximum width: ${opts.maxWidth}px`);
      }
      if (dimensions.height > opts.maxHeight) {
        errors.push(`Image height too large. Maximum height: ${opts.maxHeight}px`);
      }

      // Add warnings for very large images
      if (dimensions.width > 2000 || dimensions.height > 2000) {
        warnings.push('Large image detected. Consider resizing for better performance.');
      }
    } catch (error) {
      errors.push('Unable to read image dimensions. File may be corrupted.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get image dimensions from file
   */
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Optimize image before upload
   */
  static async optimizeImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<File> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      const dimensions = await this.getImageDimensions(file);
      
      // If image is within limits, return original
      if (dimensions.width <= opts.maxWidth && dimensions.height <= opts.maxHeight && file.size <= opts.maxSize) {
        return file;
      }

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Calculate new dimensions maintaining aspect ratio
      const { width: newWidth, height: newHeight } = this.calculateAspectRatio(
        dimensions.width,
        dimensions.height,
        opts.maxWidth,
        opts.maxHeight
      );

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Load and draw image
      const img = new Image();
      return new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Failed to optimize image'));
              }
            },
            file.type,
            opts.quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return file;
    }
  }

  /**
   * Calculate aspect ratio preserving dimensions
   */
  private static calculateAspectRatio(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

  /**
   * Upload single image
   */
  static async uploadImage(
    file: File,
    type: 'event_image' | 'avatar' | 'banner' | 'general' = 'event_image',
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Validate image
    const validation = await this.validateImage(file, opts);
    if (!validation.isValid) {
      throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
    }

    // Optimize image
    const optimizedFile = await this.optimizeImage(file, opts);

    // Upload to server
    const result = await apiClient.uploadFile<{ success: boolean; data: ImageUploadResult }>(
      '/api/uploads/single',
      optimizedFile,
      { type }
    );

    if (!result.success) {
      throw new Error('Upload failed');
    }

    return result.data;
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(
    files: File[],
    type: 'event_image' | 'avatar' | 'banner' | 'general' = 'event_image',
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, type, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image
   */
  static async deleteImage(imageId: string): Promise<void> {
    await apiClient.delete(`/api/uploads/${imageId}`);
  }

  /**
   * Get user's uploaded images
   */
  static async getUserImages(
    type?: 'event_image' | 'avatar' | 'banner' | 'general',
    page = 1,
    limit = 20
  ) {
    const params: Record<string, any> = { page, limit };
    if (type) params.type = type;

    return apiClient.get<{
      success: boolean;
      data: {
        files: ImageUploadResult[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>('/api/uploads/my-files', params);
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate thumbnail URL (if supported by backend)
   */
  static getThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    // This would depend on your backend implementation
    // For now, return the original URL
    return originalUrl;
  }

  /**
   * Check if file is an image
   */
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}

export default ImageUploadService;
