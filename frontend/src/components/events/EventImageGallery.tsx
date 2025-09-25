'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Star, 
  Download,
  ZoomIn,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { ImageUploadResult } from '@/services/image-upload.service';
import { cn } from '@/lib/utils';

export interface EventImageGalleryProps {
  images: ImageUploadResult[];
  primaryImage?: ImageUploadResult;
  showPrimaryBadge?: boolean;
  maxThumbnails?: number;
  className?: string;
  onImageClick?: (image: ImageUploadResult, index: number) => void;
  allowFullscreen?: boolean;
  showDownloadButton?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

const ImageThumbnail: React.FC<{
  image: ImageUploadResult;
  isActive: boolean;
  onClick: () => void;
  showPrimaryBadge?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}> = ({ image, isActive, onClick, showPrimaryBadge = false, aspectRatio = 'video' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'aspect-auto',
  }[aspectRatio];

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200",
        isActive 
          ? "border-primary shadow-lg scale-105" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className={cn("relative", aspectRatioClass)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <AlertCircle className="h-8 w-8" />
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.originalName}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      {showPrimaryBadge && false && ( // ImageUploadResult doesn't have isPrimary property
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
          <Star className="h-3 w-3 mr-1" />
          Primary
        </Badge>
      )}
    </div>
  );
};

const FullscreenViewer: React.FC<{
  images: ImageUploadResult[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  showDownloadButton?: boolean;
}> = ({ images, currentIndex, isOpen, onClose, onNavigate, showDownloadButton = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [rotation, setRotation] = useState(0);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setRotation(0);
    }
  }, [isOpen, currentIndex]);

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = currentImage.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1));
    if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1));
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl w-full h-[90vh] p-0" 
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium">
              {currentImage.originalName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {showDownloadButton && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                onClick={() => onNavigate(Math.min(images.length - 1, currentIndex + 1))}
                disabled={currentIndex === images.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Display */}
          <div className="w-full h-full flex items-center justify-center p-6">
            {isLoading && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {hasError ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <AlertCircle className="h-16 w-16 mb-4" />
                <p>Failed to load image</p>
              </div>
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.originalName}
                className={cn(
                  "max-w-full max-h-full object-contain transition-transform duration-200",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                style={{ transform: `rotate(${rotation}deg)` }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            )}
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EventImageGallery: React.FC<EventImageGalleryProps> = ({
  images,
  primaryImage,
  showPrimaryBadge = true,
  maxThumbnails = 6,
  className,
  onImageClick,
  allowFullscreen = true,
  showDownloadButton = true,
  aspectRatio = 'video',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Use primary image as first image if available
  const displayImages = primaryImage 
    ? [primaryImage, ...images.filter(img => img.id !== primaryImage.id)]
    : images;

  const visibleImages = displayImages.slice(0, maxThumbnails);
  const hasMoreImages = images.length > maxThumbnails;

  const handleImageClick = (image: ImageUploadResult, index: number) => {
    setSelectedIndex(index);
    if (allowFullscreen) {
      setIsFullscreenOpen(true);
    }
    onImageClick?.(image, index);
  };

  const handleNavigate = (index: number) => {
    setSelectedIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={cn("text-center py-12 text-gray-500", className)}>
        <div className="text-6xl mb-4">📷</div>
        <p className="text-lg font-medium">No images available</p>
        <p className="text-sm">Images will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleImages.map((image, index) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            isActive={selectedIndex === index}
            onClick={() => handleImageClick(image, index)}
            showPrimaryBadge={showPrimaryBadge}
            aspectRatio={aspectRatio}
          />
        ))}
        
        {hasMoreImages && (
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">+{images.length - maxThumbnails}</div>
              <div className="text-sm">more images</div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer */}
      {allowFullscreen && (
        <FullscreenViewer
          images={displayImages}
          currentIndex={selectedIndex}
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          onNavigate={handleNavigate}
          showDownloadButton={showDownloadButton}
        />
      )}
    </div>
  );
};

export default EventImageGallery;
