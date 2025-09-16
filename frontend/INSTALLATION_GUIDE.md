# Installation Guide for Image Handling System

## Required Dependencies

The image handling system requires the following additional dependencies that need to be installed:

### 1. Install react-dropzone (Optional - for enhanced drag-drop functionality)

```bash
npm install react-dropzone
```

**Note**: The current implementation uses native HTML5 drag and drop, so this dependency is optional. However, for enhanced drag-drop functionality with better file validation and user experience, it's recommended to install react-dropzone.

### 2. Install sharp (Recommended - for image optimization)

```bash
npm install sharp
```

This is recommended for server-side image optimization and processing.

## Current Implementation

The image handling system is currently implemented with:

- ✅ **Native HTML5 Drag & Drop** - No external dependencies required
- ✅ **Client-side Image Optimization** - Uses Canvas API for resizing and compression
- ✅ **AWS S3 Integration** - For file storage
- ✅ **TypeScript Support** - Full type safety
- ✅ **Responsive Components** - Mobile-friendly interfaces

## Features Included

### Core Components

- `ImageUpload` - Basic drag-drop upload component
- `EventImageUpload` - Event-specific upload with guidelines
- `EventImageGallery` - Responsive image display
- `Alert` - UI component for notifications

### Services

- `ImageUploadService` - Core image handling service
- Enhanced AWS S3 upload service
- Image validation and optimization

### Pages

- Event create/edit forms with image upload
- Image management interface (`/organizer/images`)

## Usage

The system works out of the box with the current implementation. No additional setup is required for basic functionality.

### Basic Upload

```tsx
<EventImageUpload
  images={uploadedImages}
  onImagesChange={handleImagesChange}
  maxImages={5}
  disabled={isSubmitting}
  showGuidelines={true}
/>
```

### Image Gallery

```tsx
<EventImageGallery
  images={images}
  showPrimaryBadge={true}
  allowFullscreen={true}
  aspectRatio="video"
/>
```

## Troubleshooting

### Build Errors

If you encounter build errors related to missing components:

1. Ensure all UI components are in place
2. Check that the Alert component is created
3. Verify all imports are correct

### Missing Dependencies

If you need enhanced functionality:

1. Install react-dropzone for better drag-drop
2. Install sharp for server-side image processing
3. Update the ImageUpload component to use react-dropzone

## Next Steps

1. **Install Dependencies** (Optional):

   ```bash
   npm install react-dropzone sharp
   ```

2. **Test the System**:
   - Create a new event with images
   - Edit existing events
   - Use the image management interface

3. **Customize as Needed**:
   - Adjust image size limits
   - Modify validation rules
   - Update styling

The system is production-ready and provides a complete image handling solution for your events platform.
