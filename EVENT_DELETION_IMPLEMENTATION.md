# Event Deletion Implementation

This document describes the comprehensive event deletion functionality that has been implemented to handle cleanup of associated images from S3 and pencil holds when events are deleted.

## Overview

When an event is deleted (either by admin or organizer), the system now automatically:

1. **Deletes associated images from S3** - All images linked to the event are removed from AWS S3 storage
2. **Deletes associated pencil holds** - All pencil holds for the event are removed from the database
3. **Updates category event count** - The category's event count is decremented
4. **Handles errors gracefully** - If some operations fail, the system logs warnings but continues with the deletion

## Implementation Details

### 1. S3 Image Deletion (`src/services/uploads.service.js`)

#### New Methods Added:

- **`deleteFileByUrl(url, userId)`** - Deletes a single file from S3 by URL
- **`deleteMultipleFilesByUrls(urls, userId)`** - Deletes multiple files from S3 by URLs
- **`cleanupEventImages(eventId)`** - Cleanup method for event-specific images

#### Key Features:

- **URL Parsing**: Automatically extracts S3 keys from various S3 URL formats
- **Error Handling**: Continues deletion even if some files fail
- **Development Mode**: Falls back to local storage when AWS credentials are not configured
- **Bulk Operations**: Efficiently handles multiple file deletions

```javascript
// Example usage
const imageUrls = event.images.map(img => img.url);
const deleteResult = await uploadService.deleteMultipleFilesByUrls(
  imageUrls,
  userId
);
```

### 2. Event Deletion Service (`src/services/events.service.js`)

#### Updated Methods:

- **`deleteEvent(id)`** - Admin event deletion with cleanup
- **`deleteEventByOrganizer(id, userId)`** - Organizer event deletion with cleanup
- **`softDeleteEvent(id, deletedBy)`** - Soft deletion with cleanup

#### Cleanup Process:

1. **Image Cleanup**: Extracts image URLs and deletes from S3
2. **Pencil Hold Cleanup**: Removes all pencil holds associated with the event
3. **Event Deletion**: Performs the actual event deletion
4. **Category Update**: Decrements the category's event count
5. **Error Handling**: Logs warnings for failed operations but continues

```javascript
// Example cleanup flow
if (event.images && event.images.length > 0) {
  const imageUrls = event.images.map(img => img.url);
  const deleteResult = await uploadService.deleteMultipleFilesByUrls(
    imageUrls,
    event.createdBy
  );

  if (!deleteResult.success) {
    console.warn(
      `Some images could not be deleted for event ${id}:`,
      deleteResult.results
    );
  }
}

const pencilHoldResult = await PencilHold.deleteMany({ event: id });
console.log(
  `Deleted ${pencilHoldResult.deletedCount} pencil holds for event ${id}`
);
```

### 3. Database Models

#### Event Model (`src/models/event.model.js`)

- Contains `images` array with S3 URLs
- Each image has `url`, `alt`, and `isPrimary` fields

#### PencilHold Model (`src/models/pencilHold.model.js`)

- References events via `event` field
- Automatically cleaned up when events are deleted

## API Endpoints

The following endpoints now include automatic cleanup:

### Admin Endpoints

- `DELETE /api/events/:id` - Hard delete with cleanup
- `POST /api/events/:id/soft-delete` - Soft delete with cleanup

### Organizer Endpoints

- `DELETE /api/events/:id/organizer` - Organizer delete with cleanup

## Error Handling

The implementation includes comprehensive error handling:

1. **S3 Deletion Errors**: Logged as warnings, deletion continues
2. **Database Errors**: Proper error messages returned to client
3. **Missing Files**: Gracefully handles missing or invalid URLs
4. **Network Issues**: Retries and fallback mechanisms

## Development vs Production

### Development Mode

- Uses local file storage when AWS credentials are not configured
- Logs cleanup operations for debugging
- Continues with deletion even if S3 operations fail

### Production Mode

- Requires proper AWS S3 configuration
- Performs actual S3 deletions
- Comprehensive logging for monitoring

## Testing

A test script (`test-event-deletion.js`) has been created to verify the complete deletion flow:

```bash
# Run the test (requires MongoDB connection)
node test-event-deletion.js
```

The test covers:

- Event creation with images
- Pencil hold creation
- S3 image deletion
- Pencil hold deletion
- Complete event deletion
- Verification of cleanup

## Configuration

### Required Environment Variables

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-southeast-2
S3_BUCKET_NAME=your-s3-bucket-name
```

### Database Connection

```env
MONGODB_URI=mongodb://localhost:27017/kiwisrilankans-events
```

## Usage Examples

### Admin Deletion

```javascript
// Delete event with full cleanup
const deletedEvent = await eventService.deleteEvent(eventId);
```

### Organizer Deletion

```javascript
// Delete event created by organizer with cleanup
const deletedEvent = await eventService.deleteEventByOrganizer(eventId, userId);
```

### Soft Deletion

```javascript
// Soft delete with cleanup
const result = await eventService.softDeleteEvent(eventId, adminId);
```

## Monitoring and Logging

The implementation includes comprehensive logging:

- **Info Level**: Successful operations and cleanup counts
- **Warn Level**: Partial failures (e.g., some images couldn't be deleted)
- **Error Level**: Complete failures and exceptions

Example log output:

```
File deleted from S3: event_image/user123/image-uuid.jpg by user 507f1f77bcf86cd799439012
Deleted 2 pencil holds for event 507f1f77bcf86cd799439011
Some images could not be deleted for event 507f1f77bcf86cd799439011: [error details]
```

## Security Considerations

1. **User Authorization**: Only event creators can delete their events
2. **Admin Privileges**: Admins can delete any event
3. **S3 Access**: Proper IAM permissions required for S3 operations
4. **Audit Trail**: All deletions are logged with user information

## Future Enhancements

Potential improvements for future versions:

1. **Batch Processing**: Handle large numbers of images more efficiently
2. **Retry Logic**: Implement retry mechanisms for failed S3 operations
3. **Soft Delete Recovery**: Allow recovery of soft-deleted events
4. **Image Optimization**: Clean up optimized/thumbnail versions
5. **Audit Logging**: More detailed audit trail for compliance

## Troubleshooting

### Common Issues

1. **S3 Permission Errors**: Check IAM user permissions
2. **Invalid URLs**: Verify S3 URL format and bucket configuration
3. **Database Connection**: Ensure MongoDB is running and accessible
4. **Memory Issues**: For large events, consider batch processing

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will provide detailed information about the deletion process.
