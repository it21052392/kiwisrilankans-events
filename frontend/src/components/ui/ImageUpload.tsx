'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Eye,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUploadService, ImageUploadResult, ImageUploadOptions } from '@/services/image-upload.service';
import toast from 'react-hot-toast';

export interface ImageUploadProps {
  onImagesChange: (images: ImageUploadResult[]) => void;
  initialImages?: ImageUploadResult[];
  maxImages?: number;
  uploadType?: 'event_image' | 'avatar' | 'banner' | 'general';
  options?: ImageUploadOptions;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowReorder?: boolean;
  onUploadStart?: () => void;
  onUploadComplete?: (images: ImageUploadResult[]) => void;
  onUploadError?: (error: string) => void;
}

interface ImagePreviewProps {
  image: ImageUploadResult;
  onRemove: () => void;
  onSetPrimary?: () => void;
  isPrimary?: boolean;
  showActions?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onRemove,
  onSetPrimary,
  isPrimary = false,
  showActions = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get optimized image URL for better performance
  const optimizedUrl = ImageUploadService.getOptimizedImageUrl(image.url, 400, 300);


  return (
    <div 
      className="relative group"
    >
      <div className="aspect-video rounded-lg overflow-hidden border bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <AlertCircle className="h-8 w-8" />
          </div>
        ) : (
          <img
            src={optimizedUrl}
            alt={image.originalName}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              ImageUploadService.handleImageError(e);
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      {isPrimary && (
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
          Primary
        </Badge>
      )}

      {showActions && (
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(image.url, '_blank');
            }}
            className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
            style={{ zIndex: 10 }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onSetPrimary && !isPrimary && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSetPrimary();
              }}
              className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
              style={{ zIndex: 10 }}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
            style={{ zIndex: 10 }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 truncate">
        {image.originalName}
      </div>
    </div>
  );
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  uploadType = 'event_image',
  options = {},
  className,
  disabled = false,
  showPreview = true,
  allowReorder = true,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}) => {
  const [images, setImages] = useState<ImageUploadResult[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when images change
  useEffect(() => {
    onImagesChange(images);
  }, [images]); // Removed onImagesChange from dependencies to prevent infinite loops

  const handleImageUpload = useCallback(async (files: File[]) => {
    if (disabled || isUploading) return;

    const filesToUpload = files.slice(0, maxImages - images.length);
    if (filesToUpload.length === 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const result = await ImageUploadService.uploadImage(file, uploadType, options);
        setUploadProgress(((index + 1) / filesToUpload.length) * 100);
        return result;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedImages];
      
      setImages(newImages);
      onUploadComplete?.(newImages);
      
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxImages, disabled, isUploading, uploadType, options, onUploadStart, onUploadComplete, onUploadError]);

  const handleRemoveImage = useCallback(async (imageId: string) => {
    try {
      
      // Check if this is an existing image (temporary ID) or a newly uploaded image
      const isExistingImage = imageId.startsWith('existing-');
      
      if (isExistingImage) {
        // For existing images, just remove from local state without calling API
        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        toast.success('Image removed successfully');
      } else {
        // For newly uploaded images, call the delete API
        await ImageUploadService.deleteImage(imageId);
        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        toast.success('Image deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to remove image');
    }
  }, [images]);

  const handleSetPrimary = useCallback((imageId: string) => {
    const newImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    setImages(newImages);
  }, [images]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [disabled, isUploading, handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const canUpload = images.length < maxImages && !disabled && !isUploading;
  const isSingleImageMode = maxImages === 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUpload && (
        <Card
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              multiple={!isSingleImageMode}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {dragActive 
                    ? (isSingleImageMode ? 'Drop image here' : 'Drop images here') 
                    : (isSingleImageMode ? 'Upload image' : 'Upload images')
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {isSingleImageMode 
                    ? 'Drag and drop an image here, or click to select a file'
                    : 'Drag and drop images here, or click to select files'
                  }
                </p>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, WebP, GIF (max {ImageUploadService.formatFileSize(options.maxSize || 5 * 1024 * 1024)})
                </p>
                <p className="text-xs text-gray-400">
                  {isSingleImageMode 
                    ? (images.length === 0 ? 'No image uploaded' : 'Image uploaded')
                    : `${images.length}/${maxImages} images uploaded`
                  }
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                className="mt-4"
                disabled={disabled || isUploading}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {isSingleImageMode ? 'Choose Image' : 'Choose Images'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading images...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {isSingleImageMode ? 'Uploaded Image' : 'Uploaded Images'}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {images.length}/{maxImages}
              </Badge>
              {images.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setImages([])}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isSingleImageMode ? 'Remove Image' : 'Clear All'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <ImagePreview
                key={image.id}
                image={image}
                onRemove={() => handleRemoveImage(image.id)}
                onSetPrimary={allowReorder ? () => handleSetPrimary(image.id) : undefined}
                isPrimary={false} // ImageUploadResult doesn't have isPrimary property
                showActions={!disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Limit Reached */}
      {images.length >= maxImages && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isSingleImageMode 
              ? 'Image uploaded. Remove the current image to upload a different one.'
              : `Maximum number of images (${maxImages}) reached. Remove an image to upload more.`
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUpload;
