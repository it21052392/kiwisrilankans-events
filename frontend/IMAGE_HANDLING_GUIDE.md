# Image Handling System Guide

This guide explains the comprehensive image handling system implemented for the Kiwi Sri Lankans Events platform.

## Overview

The image handling system provides a complete solution for uploading, managing, displaying, and optimizing images for events. It includes:

- **Image Upload Service** - Handles file validation, optimization, and upload to AWS S3
- **Reusable Components** - Drag-drop upload, image gallery, and management interfaces
- **Event Integration** - Seamless integration with event creation and editing
- **Image Management** - Dedicated interface for organizers to manage their images
- **Responsive Display** - Optimized image display with lazy loading and error handling

## Architecture

### Frontend Components

#### 1. ImageUploadService (`/services/image-upload.service.ts`)

Core service for handling image operations:

```typescript
// Upload single image
const result = await ImageUploadService.uploadImage(file, 'event_image', {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 4000,
  maxHeight: 4000,
  quality: 0.8,
});

// Upload multiple images
const results = await ImageUploadService.uploadImages(files, 'event_image');

// Validate image before upload
const validation = await ImageUploadService.validateImage(file, options);
```

**Features:**

- File validation (type, size, dimensions)
- Image optimization (resize, compress, format conversion)
- Progress tracking
- Error handling
- TypeScript support

#### 2. ImageUpload Component (`/components/ui/ImageUpload.tsx`)

Reusable drag-drop upload component:

```tsx
<ImageUpload
  onImagesChange={images => setImages(images)}
  maxImages={5}
  uploadType="event_image"
  options={{
    maxSize: 5 * 1024 * 1024,
    maxWidth: 4000,
    maxHeight: 4000,
    quality: 0.85,
  }}
  disabled={false}
  showPreview={true}
  allowReorder={true}
/>
```

**Features:**

- Drag and drop support
- File validation
- Image preview
- Progress indication
- Error handling
- Reorder functionality

#### 3. EventImageUpload Component (`/components/events/EventImageUpload.tsx`)

Specialized component for event image uploads:

```tsx
<EventImageUpload
  images={uploadedImages}
  onImagesChange={handleImagesChange}
  maxImages={5}
  disabled={isSubmitting}
  showGuidelines={true}
/>
```

**Features:**

- Event-specific guidelines
- Primary image selection
- Image statistics
- Upload validation
- User-friendly interface

#### 4. EventImageGallery Component (`/components/events/EventImageGallery.tsx`)

Responsive image display component:

```tsx
<EventImageGallery
  images={images}
  primaryImage={primaryImage}
  showPrimaryBadge={true}
  maxThumbnails={6}
  allowFullscreen={true}
  aspectRatio="video"
  onImageClick={(image, index) => handleClick(image, index)}
/>
```

**Features:**

- Responsive grid layout
- Fullscreen viewer
- Image navigation
- Download functionality
- Lazy loading
- Error handling

### Backend Integration

#### Upload Service (`/src/services/uploads.service.js`)

Enhanced AWS S3 upload service:

```javascript
// Upload with metadata
const result = await uploadService.uploadSingle(file, 'event_image', userId);

// Get image dimensions
const dimensions = await uploadService.getImageDimensions(buffer);

// Generate signed URLs
const signedUrl = await uploadService.generateSignedUrl(key, 3600);
```

**Features:**

- AWS S3 integration
- Image metadata extraction
- Cache control headers
- Signed URL generation
- File validation
- Error handling

## Usage Examples

### 1. Event Creation Form

```tsx
// In event create/edit form
const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([]);

const handleImagesChange = (images: ImageUploadResult[]) => {
  setUploadedImages(images);
  setFormData(prev => ({
    ...prev,
    images: images.map(img => ({
      url: img.url,
      alt: img.originalName,
      isPrimary: img.isPrimary,
    })),
  }));
};

return (
  <EventImageUpload
    images={uploadedImages}
    onImagesChange={handleImagesChange}
    maxImages={5}
    disabled={isSubmitting}
    showGuidelines={true}
  />
);
```

### 2. Image Management Page

```tsx
// In image management interface
const [images, setImages] = useState<ImageUploadResult[]>([]);

useEffect(() => {
  loadImages();
}, []);

const loadImages = async () => {
  const response = await ImageUploadService.getUserImages(
    'event_image',
    1,
    100
  );
  if (response.success) {
    setImages(response.data.files);
  }
};

const handleImageUpload = async (files: File[]) => {
  const uploadResults = await ImageUploadService.uploadImages(
    files,
    'event_image'
  );
  setImages(prev => [...prev, ...uploadResults]);
};
```

### 3. Event Display

```tsx
// In event details modal or page
<EventImageGallery
  images={event.images.map((img, index) => ({
    id: `event-${index}`,
    filename: img.url.split('/').pop() || `image-${index}`,
    originalName: img.alt || `Event image ${index + 1}`,
    url: img.url,
    size: 0,
    type: 'image/jpeg',
    uploadType: 'event_image',
    uploadedBy: '',
    uploadedAt: new Date().toISOString(),
    isPrimary: img.isPrimary || index === 0,
  }))}
  showPrimaryBadge={true}
  allowFullscreen={true}
  aspectRatio="video"
/>
```

## Configuration

### Image Upload Options

```typescript
interface ImageUploadOptions {
  maxSize?: number; // Maximum file size in bytes (default: 5MB)
  allowedTypes?: string[]; // Allowed MIME types
  maxWidth?: number; // Maximum image width (default: 4000)
  maxHeight?: number; // Maximum image height (default: 4000)
  quality?: number; // JPEG quality 0-1 (default: 0.8)
  generateThumbnail?: boolean; // Generate thumbnail (default: true)
}
```

### Upload Types

- `event_image` - Event cover and gallery images
- `avatar` - User profile pictures
- `banner` - Site banners and headers
- `general` - General purpose uploads

### File Validation

The system validates:

- **File Type**: Only image files (JPEG, PNG, WebP, GIF)
- **File Size**: Configurable maximum size (default: 5MB)
- **Dimensions**: Maximum width/height limits
- **Aspect Ratio**: Maintained during optimization

## Performance Optimizations

### 1. Image Optimization

- Automatic resizing for large images
- JPEG quality optimization
- Format conversion when beneficial
- Lazy loading for image galleries

### 2. Caching

- AWS S3 cache control headers
- Browser caching for static assets
- CDN integration ready

### 3. Error Handling

- Graceful fallbacks for failed uploads
- Retry mechanisms for network issues
- User-friendly error messages

## Security Considerations

### 1. File Validation

- MIME type verification
- File extension validation
- Size limits enforcement
- Malicious file detection

### 2. Access Control

- User-based upload permissions
- File ownership verification
- Admin-only bulk operations

### 3. Data Protection

- Secure file storage on AWS S3
- Signed URLs for temporary access
- No sensitive data in file names

## API Endpoints

### Upload Endpoints

- `POST /api/uploads/single` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files
- `GET /api/uploads/my-files` - Get user's files
- `DELETE /api/uploads/:id` - Delete file

### Event Integration

- Event creation/update includes image data
- Image URLs stored in event documents
- Primary image selection support

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size and type
   - Verify network connection
   - Check AWS S3 credentials

2. **Images Not Displaying**
   - Verify image URLs are accessible
   - Check CORS configuration
   - Validate image format

3. **Performance Issues**
   - Enable image optimization
   - Use appropriate image sizes
   - Implement lazy loading

### Debug Mode

Enable debug logging in the ImageUploadService:

```typescript
// Add to your environment variables
NEXT_PUBLIC_DEBUG_IMAGES = true;
```

## Future Enhancements

### Planned Features

- AI-powered image tagging
- Automatic image cropping
- Advanced image filters
- Batch processing
- Image analytics

### Integration Opportunities

- CDN integration (CloudFront)
- Image processing service (Sharp)
- AI image analysis
- Social media integration

## Support

For issues or questions regarding the image handling system:

1. Check the console for error messages
2. Verify file permissions and AWS configuration
3. Review the API documentation
4. Contact the development team

## Changelog

### Version 1.0.0

- Initial implementation
- Basic upload functionality
- Image optimization
- Event integration
- Management interface
