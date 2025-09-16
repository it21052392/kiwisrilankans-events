'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Image as ImageIcon, 
  Star, 
  AlertCircle,
  Info,
  Camera,
  Palette
} from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { ImageUploadResult } from '@/services/image-upload.service';
import { cn } from '@/lib/utils';

export interface EventImageUploadProps {
  images: ImageUploadResult[];
  onImagesChange: (images: ImageUploadResult[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
  showGuidelines?: boolean;
}

const ImageGuidelines: React.FC = () => (
  <Alert className="mb-4">
    <Info className="h-4 w-4" />
    <AlertDescription>
      <div className="space-y-2">
        <p className="font-medium">Image Guidelines:</p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Use high-quality images that represent your event well</li>
          <li>Recommended size: 1200x800px or similar aspect ratio</li>
          <li>Supported formats: JPG, PNG, WebP, GIF</li>
          <li>Maximum file size: 5MB per image</li>
          <li>First image will be used as the primary/cover image</li>
          <li>Images will be automatically optimized for web display</li>
        </ul>
      </div>
    </AlertDescription>
  </Alert>
);

const ImageStats: React.FC<{ images: ImageUploadResult[] }> = ({ images }) => {
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const primaryImage = images.find(img => img.isPrimary);
  
  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span>{images.length} image{images.length !== 1 ? 's' : ''}</span>
        <span>{Math.round(totalSize / 1024 / 1024 * 100) / 100} MB total</span>
        {primaryImage && (
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Primary: {primaryImage.originalName}
          </Badge>
        )}
      </div>
    </div>
  );
};

export const EventImageUpload: React.FC<EventImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  className,
  disabled = false,
  showGuidelines = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImagesChange = (newImages: ImageUploadResult[]) => {
    // Ensure at least one image is marked as primary
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    
    onImagesChange(newImages);
    setHasError(false);
    setErrorMessage('');
  };

  const handleUploadError = (error: string) => {
    setHasError(true);
    setErrorMessage(error);
  };

  const handleUploadStart = () => {
    setHasError(false);
    setErrorMessage('');
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Event Images
          {images.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {images.length}/{maxImages}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showGuidelines && <ImageGuidelines />}
        
        {hasError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <ImageUpload
          onImagesChange={handleImagesChange}
          initialImages={images}
          maxImages={maxImages}
          uploadType="event_image"
          options={{
            maxSize: 5 * 1024 * 1024, // 5MB
            maxWidth: 4000,
            maxHeight: 4000,
            quality: 0.85,
            generateThumbnail: true,
          }}
          disabled={disabled}
          showPreview={true}
          allowReorder={true}
          onUploadStart={handleUploadStart}
          onUploadError={handleUploadError}
        />

        {images.length > 0 && <ImageStats images={images} />}

        {images.length === 0 && !disabled && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No images uploaded yet</p>
            <p className="text-sm">Upload images to make your event more attractive</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventImageUpload;
