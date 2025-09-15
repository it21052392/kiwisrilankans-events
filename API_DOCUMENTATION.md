# Kiwi Sri Lankans Events API Documentation

## 🆕 **Latest Updates & New Features**

### **✅ State Machine & Status Management:**

- **Complete Event Status Flow**: Draft → Pending Approval → Published → Unpublished/Rejected/Cancelled/Deleted
- **Pencil Hold Status Flow**: Pending → Confirmed → Converted (with 48-hour auto-expiry)
- **Soft Delete System**: Events can be soft deleted and restored
- **Unpublish Functionality**: Published events can be unpublished by admins

### **✅ Public Features & Views:**

- **Multiple View Types**: List, Grid, and Calendar views for events
- **Auto-hide Past Events**: Past events automatically hidden from public views
- **Event Sharing System**: Complete social media sharing (Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email)
- **Slug-based URLs**: SEO-friendly event URLs for sharing
- **Event Detail Pages**: Dedicated endpoints for public event viewing

### **✅ Enhanced Event Management:**

- **Organizer Self-Service**: Organizers can update/delete their own events
- **Admin Controls**: Full admin control over event lifecycle
- **Pencil Hold System**: 48-hour temporary event slot booking for organizers
- **Conflict Prevention**: Time/location conflict checking for pencil holds

### **✅ Removed Features:**

- **Event Registration**: Removed all registration functionality as requested
- **Reminder System**: Removed all notification/reminder features
- **Subscription Management**: Removed subscription endpoints and services

---

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🏠 **Root & Health Endpoints**

### 1. Welcome Page

- **GET** `/`
- **Description**: Welcome message and API information
- **Authentication**: None required
- **Response**:

```json
{
  "success": true,
  "message": "Welcome to Kiwi Sri Lankans Events API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "api": "/api",
    "docs": "/api/version"
  }
}
```

### 2. Health Check

- **GET** `/health`
- **Description**: Server health status
- **Authentication**: None required
- **Response**:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 3. API Version

- **GET** `/api/version`
- **Description**: API version information
- **Authentication**: None required
- **Response**:

```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "name": "Kiwi Sri Lankans Events API",
    "description": "Event management platform for the Kiwi Sri Lankan community"
  }
}
```

---

## 🔐 **Authentication Endpoints**

**Note**: This system uses Google OAuth for authentication. Users must have a Google account and be whitelisted by an admin to access the system.

### 4. Google OAuth for Organizers

- **GET** `/api/auth/google/organizer`
- **Description**: Initiate Google OAuth flow for organizer role
- **Authentication**: None required
- **Response**: Redirects to Google OAuth consent screen

### 5. Google OAuth for Admins

- **GET** `/api/auth/google/admin`
- **Description**: Initiate Google OAuth flow for admin role
- **Authentication**: None required
- **Response**: Redirects to Google OAuth consent screen

### 6. Google OAuth Callback

- **GET** `/api/auth/google/callback`
- **Description**: Handle Google OAuth callback and create/login user
- **Authentication**: None required
- **Query Parameters**:
  - `code`: Authorization code from Google
  - `state`: State parameter containing role information
- **Response**: Redirects to frontend with JWT token and user role

### 7. Refresh Token

- **POST** `/api/auth/refresh`
- **Description**: Refresh JWT access token using refresh token cookie
- **Authentication**: None required (uses refresh token cookie)
- **Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "organizer"
    }
  }
}
```

### 8. Logout

- **POST** `/api/auth/logout`
- **Description**: Logout user and clear refresh token
- **Authentication**: Required
- **Response**:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 9. Get Current User

- **GET** `/api/auth/me`
- **Description**: Get current user profile information
- **Authentication**: Required
- **Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "organizer",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 10. Test Admin Access

- **GET** `/api/auth/test-admin`
- **Description**: Test endpoint to verify admin access
- **Authentication**: Required (Admin only)
- **Response**:

```json
{
  "success": true,
  "message": "Admin access verified",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 👤 **User Role System & Access Control**

This system uses a role-based access control (RBAC) with Google OAuth authentication:

### **User Roles:**

- **`organizer`**: Can create events (saved as draft), manage their own events
- **`admin`**: Can approve/reject events, manage users, access admin panel

### **Access Control:**

- Users must be **whitelisted by an admin** before they can authenticate
- Only whitelisted email addresses can access the system via Google OAuth
- Role is determined during the OAuth flow based on the whitelist entry

### **Authentication Flow:**

1. Admin adds email to whitelist with specific role
2. User visits Google OAuth endpoint for their role (`/google/organizer` or `/google/admin`)
3. Google OAuth redirects to callback with user info
4. System checks if email is whitelisted and creates/logs in user
5. User receives JWT token and can access system based on their role

---

## 👥 **User Management Endpoints**

### 11. Get All Users (Admin)

- **GET** `/api/users`
- **Description**: Get paginated list of all users
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 12. Get User by ID (Admin)

- **GET** `/api/users/:id`
- **Description**: Get specific user details
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)

### 13. Update User (Admin)

- **PUT** `/api/users/:id`
- **Description**: Update user details
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": true
}
```

### 14. Delete User (Admin)

- **DELETE** `/api/users/:id`
- **Description**: Delete user
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)

### 15. Update Profile

- **PUT** `/api/users/profile`
- **Description**: Update current user's profile
- **Authentication**: Required
- **Request Body**:

```json
{
  "name": "New Name",
  "bio": "User bio",
  "phone": "+64 21 123 4567",
  "address": {
    "street": "123 Main St",
    "city": "Auckland",
    "country": "New Zealand"
  }
}
```

## 🎯 **Event Management Endpoints**

### 17. Get All Events

- **GET** `/api/events`
- **Description**: Get paginated list of events with multiple view options
- **Authentication**: None required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `category` (optional): Category ID
  - `status` (optional): Event status (draft, pending_approval, published, rejected, unpublished, cancelled, completed, deleted)
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
  - `sortBy` (optional): Sort field (startDate, endDate, title, createdAt, price, capacity)
  - `sortOrder` (optional): Sort order (asc, desc)
  - `view` (optional): View type (list, grid, calendar) - default: list
  - `hidePast` (optional): Hide past events (true/false) - default: true

### 18. Get Event by ID

- **GET** `/api/events/:id`
- **Description**: Get specific event details
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 18.1. Get Event by Slug

- **GET** `/api/events/slug/:slug`
- **Description**: Get event details by slug (for public sharing)
- **Authentication**: None required
- **Path Parameters**:
  - `slug`: Event slug (URL-friendly identifier)

### 18.2. Get Events for Calendar View

- **GET** `/api/events/calendar`
- **Description**: Get events formatted for calendar display with date grouping
- **Authentication**: None required
- **Query Parameters**:
  - `startDate` (optional): Start date for calendar range
  - `endDate` (optional): End date for calendar range
  - `category` (optional): Filter by category ID
  - `search` (optional): Search term
- **Response**:

```json
{
  "success": true,
  "data": {
    "events": [...],
    "eventsByDate": {
      "2024-02-15": [...],
      "2024-02-16": [...]
    },
    "total": 25
  }
}
```

### 18.3. Get Events for Grid View

- **GET** `/api/events/grid`
- **Description**: Get events optimized for grid/card display
- **Authentication**: None required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 12)
  - `category` (optional): Filter by category ID
  - `search` (optional): Search term
  - `sortBy` (optional): Sort field (startDate, endDate, title, createdAt, price, capacity)
  - `sortOrder` (optional): Sort order (asc, desc)

### 19. Create Event (Admin/Organizer)

- **POST** `/api/events`
- **Description**: Create new event
- **Authentication**: Required (Admin or Organizer)
- **Request Body**:

```json
{
  "title": "Sri Lankan Cultural Night",
  "description": "A wonderful evening celebrating Sri Lankan culture with food, music, and dance",
  "category": "64a1b2c3d4e5f6789012345",
  "startDate": "2024-02-15T18:00:00.000Z",
  "endDate": "2024-02-15T23:00:00.000Z",
  "registrationDeadline": "2024-02-10T23:59:59.000Z",
  "location": {
    "name": "Auckland Town Hall",
    "address": "303 Queen Street, Auckland",
    "city": "Auckland",
    "coordinates": {
      "latitude": -36.8485,
      "longitude": 174.7633
    }
  },
  "capacity": 200,
  "price": 25.0,
  "currency": "NZD",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Cultural night poster",
      "isPrimary": true
    }
  ],
  "tags": ["culture", "food", "music", "dance"],
  "requirements": ["Valid ID required", "Dress code: Smart casual"],
  "contactInfo": {
    "name": "Event Organizer",
    "email": "events@kiwisrilankans.com",
    "phone": "+64 21 123 4567"
  }
}
```

### 20. Update Event (Admin)

- **PUT** `/api/events/:id`
- **Description**: Update event details
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Request Body**: Same as create event (all fields optional)

### 21. Delete Event (Admin)

- **DELETE** `/api/events/:id`
- **Description**: Delete event permanently
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 21.1. Soft Delete Event (Admin)

- **DELETE** `/api/events/:id/soft`
- **Description**: Soft delete event (can be restored)
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### 21.2. Restore Event (Admin)

- **PATCH** `/api/events/:id/restore`
- **Description**: Restore soft deleted event
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Event restored successfully"
}
```

### 21.3. Unpublish Event (Admin)

- **PATCH** `/api/events/:id/unpublish`
- **Description**: Unpublish a published event
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Event unpublished successfully"
}
```

### 22. Update Event by Organizer

- **PUT** `/api/events/:id/organizer`
- **Description**: Update event by organizer (only their own events)
- **Authentication**: Required (Admin or Organizer)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Request Body**: Same as create event (restricted fields)
- **Note**: Organizers can only update their own events and cannot change status, featured, or approval-related fields

### 23. Delete Event by Organizer

- **DELETE** `/api/events/:id/organizer`
- **Description**: Delete event by organizer (only their own events)
- **Authentication**: Required (Admin or Organizer)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Note**: Organizers can only delete their own events

---

## 📂 **Category Management Endpoints**

### 25. Get All Categories

- **GET** `/api/categories`
- **Description**: Get paginated list of categories
- **Authentication**: None required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `active` (optional): Filter by active status (true/false)

### 26. Get Category by ID

- **GET** `/api/categories/:id`
- **Description**: Get specific category details
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Category ID (MongoDB ObjectId)

### 27. Create Category (Admin)

- **POST** `/api/categories`
- **Description**: Create new category
- **Authentication**: Required (Admin only)
- **Request Body**:

```json
{
  "name": "Cultural Events",
  "description": "Events celebrating Sri Lankan culture",
  "color": "#FF6B6B",
  "icon": "culture",
  "sortOrder": 1
}
```

### 28. Update Category (Admin)

- **PUT** `/api/categories/:id`
- **Description**: Update category details
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Category ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "color": "#4ECDC4",
  "icon": "updated-icon",
  "active": true,
  "sortOrder": 2
}
```

### 29. Delete Category (Admin)

- **DELETE** `/api/categories/:id`
- **Description**: Delete category
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Category ID (MongoDB ObjectId)

### 30. Toggle Category Status (Admin)

- **PATCH** `/api/categories/:id/toggle`
- **Description**: Toggle category active status
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Category ID (MongoDB ObjectId)

---

## ✏️ **Pencil Hold Management Endpoints**

### 31. Get All Pencil Holds

- **GET** `/api/pencil-holds`
- **Description**: Get paginated list of pencil holds
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `status` (optional): Hold status (pending, confirmed, converted, cancelled, expired)
  - `eventId` (optional): Filter by event ID

### 32. Get Pencil Hold by ID

- **GET** `/api/pencil-holds/:id`
- **Description**: Get specific pencil hold details
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)

### 33. Create Pencil Hold

- **POST** `/api/pencil-holds`
- **Description**: Create new pencil hold
- **Authentication**: Required (Admin or Organizer)
- **Request Body**:

```json
{
  "eventId": "64a1b2c3d4e5f6789012345",
  "notes": "Interested in this event, please pencil me in",
  "additionalInfo": {
    "preferredTime": "Evening",
    "groupSize": 2
  },
  "priority": 5,
  "expiresAt": "2024-02-01T23:59:59.000Z"
}
```

### 34. Update Pencil Hold

- **PUT** `/api/pencil-holds/:id`
- **Description**: Update pencil hold details
- **Authentication**: Required (Admin or Organizer)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "notes": "Updated notes",
  "additionalInfo": {
    "preferredTime": "Afternoon"
  },
  "priority": 7,
  "expiresAt": "2024-02-05T23:59:59.000Z"
}
```

### 35. Delete Pencil Hold

- **DELETE** `/api/pencil-holds/:id`
- **Description**: Delete pencil hold
- **Authentication**: Required (Admin or Organizer)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)

### 36. Get My Pencil Holds

- **GET** `/api/pencil-holds/my-holds`
- **Description**: Get current user's pencil holds
- **Authentication**: Required (Admin or Organizer)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 37. Confirm Pencil Hold (Organizer)

- **PATCH** `/api/pencil-holds/:id/confirm`
- **Description**: Confirm pencil hold (convert to confirmed status)
- **Authentication**: Required (Admin or Organizer)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Pencil hold confirmed successfully"
}
```

### 38. Approve Pencil Hold (Admin)

- **PATCH** `/api/pencil-holds/:id/approve`
- **Description**: Approve confirmed pencil hold (converts to event)
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Pencil hold approved successfully"
}
```

### 38.1. Cancel Pencil Hold (Admin)

- **PATCH** `/api/pencil-holds/:id/cancel`
- **Description**: Cancel pencil hold
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "reason": "Event capacity reached"
}
```

---

## 🔗 **Event Sharing Endpoints**

### 39. Get Event Sharing Data

- **GET** `/api/sharing/events/:id/share`
- **Description**: Get event data and sharing links
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "data": {
    "event": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "title": "Event Title",
      "description": "Event description",
      "startDate": "2024-02-15T18:00:00Z",
      "endDate": "2024-02-15T23:00:00Z",
      "location": {...},
      "category": {...},
      "images": [...]
    },
    "sharing": {
      "url": {
        "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
        "twitter": "https://twitter.com/intent/tweet?url=...",
        "linkedin": "https://www.linkedin.com/sharing/share-offsite/?url=...",
        "whatsapp": "https://wa.me/?text=...",
        "telegram": "https://t.me/share/url?url=...",
        "email": "mailto:?subject=...&body=..."
      },
      "copyText": "Check out this event: Event Title - [URL]"
    }
  }
}
```

### 40. Generate Shareable Link

- **POST** `/api/sharing/events/:id/share/link`
- **Description**: Generate shareable link for event
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "data": {
    "url": "https://yourapp.com/events/event-slug",
    "title": "Event Title",
    "description": "Event description",
    "startDate": "2024-02-15T18:00:00Z",
    "endDate": "2024-02-15T23:00:00Z",
    "location": {...},
    "category": {...},
    "image": "https://example.com/image.jpg"
  }
}
```

### 41. Get Social Media Links

- **GET** `/api/sharing/events/:id/share/social`
- **Description**: Get social media sharing links
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "data": {
    "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
    "twitter": "https://twitter.com/intent/tweet?url=...",
    "linkedin": "https://www.linkedin.com/sharing/share-offsite/?url=...",
    "whatsapp": "https://wa.me/?text=...",
    "telegram": "https://t.me/share/url?url=...",
    "email": "mailto:?subject=...&body=..."
  }
}
```

### 42. Track Share Event

- **POST** `/api/sharing/events/:id/share/track`
- **Description**: Track when event is shared
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "platform": "facebook"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Share tracked successfully"
}
```

### 43. Get Event by Slug (Public)

- **GET** `/api/sharing/events/slug/:slug`
- **Description**: Get event by slug for public sharing
- **Authentication**: None required
- **Path Parameters**:
  - `slug`: Event slug (URL-friendly identifier)
- **Response**:

```json
{
  "success": true,
  "data": {
    "event": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "title": "Event Title",
      "description": "Event description",
      "slug": "event-slug",
      "startDate": "2024-02-15T18:00:00Z",
      "endDate": "2024-02-15T23:00:00Z",
      "location": {...},
      "category": {...},
      "images": [...],
      "price": 25.0,
      "currency": "NZD",
      "capacity": 200,
      "registrationCount": 45,
      "tags": [...],
      "requirements": [...],
      "contactInfo": {...},
      "featured": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

## 📁 **File Upload Endpoints**

### 47. Upload Single File

- **POST** `/api/uploads/single`
- **Description**: Upload a single file
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: File to upload (max 10MB)
  - `folder` (optional): Upload folder name
  - `isPublic` (optional): Make file public (boolean)

### 48. Upload Multiple Files

- **POST** `/api/uploads/multiple`
- **Description**: Upload multiple files
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `files`: Array of files to upload (max 5 files, 10MB each)
  - `folder` (optional): Upload folder name
  - `isPublic` (optional): Make files public (boolean)

### 49. Get File by ID

- **GET** `/api/uploads/:id`
- **Description**: Get file details
- **Authentication**: Required
- **Path Parameters**:
  - `id`: File ID (MongoDB ObjectId)

### 50. Get My Files

- **GET** `/api/uploads/my-files`
- **Description**: Get current user's files
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 51. Delete File

- **DELETE** `/api/uploads/:id`
- **Description**: Delete file
- **Authentication**: Required
- **Path Parameters**:
  - `id`: File ID (MongoDB ObjectId)

### 52. Get Download URL

- **GET** `/api/uploads/:id/download`
- **Description**: Get file download URL
- **Authentication**: Required
- **Path Parameters**:
  - `id`: File ID (MongoDB ObjectId)

### 53. Get All Files (Admin)

- **GET** `/api/uploads`
- **Description**: Get all files
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 54. Cleanup Orphaned Files (Admin)

- **POST** `/api/uploads/cleanup`
- **Description**: Cleanup orphaned files
- **Authentication**: Required (Admin only)

---

## 👨‍💼 **Admin Management Endpoints**

### 55. Get Dashboard Stats

- **GET** `/api/admin/dashboard`
- **Description**: Get admin dashboard statistics
- **Authentication**: Required (Admin only)

### 56. Get All Users (Admin)

- **GET** `/api/admin/users`
- **Description**: Get all users with admin details
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 57. Get User Details (Admin)

- **GET** `/api/admin/users/:id`
- **Description**: Get detailed user information
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)

### 58. Update User Role (Admin)

- **PUT** `/api/admin/users/:id/role`
- **Description**: Update user role
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "role": "admin"
}
```

### 59. Toggle User Status (Admin)

- **PATCH** `/api/admin/users/:id/status`
- **Description**: Toggle user active status
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: User ID (MongoDB ObjectId)

### 60. Get All Events (Admin)

- **GET** `/api/admin/events`
- **Description**: Get all events with admin details
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 61. Get Event Analytics (Admin)

- **GET** `/api/admin/events/:id/analytics`
- **Description**: Get event analytics
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 62. Get System Logs (Admin)

- **GET** `/api/admin/logs`
- **Description**: Get system logs
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `level` (optional): Log level (error, warn, info, debug)
  - `startDate` (optional): Start date filter
  - `endDate` (optional): End date filter
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)

### 63. Send Bulk Notification (Admin)

- **POST** `/api/admin/notifications/bulk`
- **Description**: Send bulk notification
- **Authentication**: Required (Admin only)
- **Request Body**:

```json
{
  "type": "email",
  "subject": "Important Update",
  "message": "This is a bulk notification message",
  "targetUsers": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"],
  "targetRoles": ["user", "admin"],
  "scheduledAt": "2024-02-01T10:00:00.000Z"
}
```

### 64. Get Pending Events (Admin)

- **GET** `/api/admin/events/pending`
- **Description**: Get events pending approval (draft status)
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response**:

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef0",
        "title": "Event Title",
        "description": "Event description",
        "status": "draft",
        "createdBy": {
          "name": "Organizer Name",
          "email": "organizer@example.com",
          "role": "organizer"
        },
        "category": {
          "name": "Category Name",
          "color": "#FF6B6B"
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 65. Approve Event (Admin)

- **PATCH** `/api/admin/events/:id/approve`
- **Description**: Approve an event (change status from draft to published)
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Response**:

```json
{
  "success": true,
  "message": "Event approved successfully",
  "data": {
    "event": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "title": "Event Title",
      "status": "published",
      "approvedBy": "64a1b2c3d4e5f6789abcdef1",
      "approvedAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

### 66. Reject Event (Admin)

- **PATCH** `/api/admin/events/:id/reject`
- **Description**: Reject an event (change status from draft to cancelled)
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "reason": "Event content doesn't meet our guidelines"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Event rejected successfully",
  "data": {
    "event": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "title": "Event Title",
      "status": "cancelled",
      "rejectedBy": "64a1b2c3d4e5f6789abcdef1",
      "rejectedAt": "2024-01-15T12:00:00Z",
      "rejectionReason": "Event content doesn't meet our guidelines"
    }
  }
}
```

### 67. Add Email to Whitelist (Admin)

- **POST** `/api/admin/whitelist`
- **Description**: Add email to admin whitelist for system access
- **Authentication**: Required (Admin only)
- **Request Body**:

```json
{
  "email": "newuser@example.com"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Email added to admin whitelist successfully",
  "data": {
    "whitelistEntry": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "email": "newuser@example.com",
      "addedAt": "2024-01-15T10:00:00Z",
      "isActive": true
    }
  }
}
```

### 68. Get Whitelisted Emails (Admin)

- **GET** `/api/admin/whitelist`
- **Description**: Get all whitelisted email addresses
- **Authentication**: Required (Admin only)
- **Response**:

```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "64a1b2c3d4e5f6789abcdef0",
        "email": "user@example.com",
        "addedBy": {
          "id": "64a1b2c3d4e5f6789abcdef1",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "addedAt": "2024-01-15T10:00:00Z",
        "isActive": true
      }
    ]
  }
}
```

### 69. Remove Email from Whitelist (Admin)

- **DELETE** `/api/admin/whitelist/:email`
- **Description**: Remove email from admin whitelist
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `email`: Email address to remove from whitelist
- **Response**:

```json
{
  "success": true,
  "message": "Email removed from admin whitelist successfully",
  "data": {
    "removedEmail": "user@example.com",
    "removedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 70. Check Email Whitelist Status (Admin)

- **GET** `/api/admin/whitelist/check/:email`
- **Description**: Check if an email is whitelisted
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `email`: Email address to check
- **Response**:

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "isWhitelisted": true
  }
}
```

### 71. Get Whitelist Statistics (Admin)

- **GET** `/api/admin/whitelist/stats`
- **Description**: Get whitelist statistics
- **Authentication**: Required (Admin only)
- **Response**:

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalWhitelisted": 25,
      "activeEmails": 23,
      "inactiveEmails": 2,
      "recentlyAdded": 5
    }
  }
}
```

---

## 🔄 **Event Status Workflow & State Machine**

The event management system now includes a comprehensive state machine with multiple statuses and workflows:

### **Event Status Flow:**

```
Draft → Pending Approval → Published → Unpublished
  ↓           ↓              ↓
Rejected   Rejected      Cancelled
  ↓           ↓              ↓
Deleted ← Deleted ← Deleted
```

### **Status Definitions:**

- **`draft`**: Initial status when organizer creates event (not visible to public)
- **`pending_approval`**: Event submitted for admin review
- **`published`**: Event approved and visible to public
- **`rejected`**: Event rejected by admin (not visible to public)
- **`unpublished`**: Published event taken down by admin
- **`cancelled`**: Event cancelled (not visible to public)
- **`completed`**: Event has finished
- **`deleted`**: Event soft deleted (not visible to public)

### **Pencil Hold Status Flow:**

```
Pending → Confirmed → Converted
   ↓         ↓          ↓
Cancelled  Expired   (Event Published)
```

### **Status Definitions:**

- **`pending`**: Initial status when pencil hold is created
- **`confirmed`**: Organizer has confirmed the pencil hold
- **`converted`**: Admin approved and event was published
- **`cancelled`**: Pencil hold was cancelled
- **`expired`**: Pencil hold expired after 48 hours

### **Workflow Process:**

1. **Organizers create events** → Events saved with `status: "draft"`
2. **Organizers submit for approval** → Status changes to `pending_approval`
3. **Admins review events** → Use `GET /api/admin/events/pending`
4. **Admins approve events** → Use `PATCH /api/admin/events/:id/approve` → Status: `published`
5. **OR Admins reject events** → Use `PATCH /api/admin/events/:id/reject` → Status: `rejected`
6. **Admins can unpublish** → Use `PATCH /api/events/:id/unpublish` → Status: `unpublished`
7. **Soft delete events** → Use `DELETE /api/events/:id/soft` → Status: `deleted`
8. **Restore deleted events** → Use `PATCH /api/events/:id/restore` → Status: `draft`

### **Event Model Fields:**

- `status`: Current event status (enum)
- `approvedBy`: Admin who approved the event
- `approvedAt`: When the event was approved
- `rejectedBy`: Admin who rejected the event
- `rejectedAt`: When the event was rejected
- `rejectionReason`: Reason for rejection (max 500 characters)
- `unpublishedBy`: Admin who unpublished the event
- `unpublishedAt`: When the event was unpublished
- `isDeleted`: Soft delete flag
- `deletedAt`: When the event was soft deleted
- `deletedBy`: Admin who soft deleted the event

---

## 🌐 **Public Features & Views**

The API now supports multiple view types and public features for event discovery:

### **View Types:**

1. **List View** (default): Traditional paginated list of events
2. **Grid View**: Card-based layout optimized for visual browsing
3. **Calendar View**: Events grouped by date for calendar display

### **Public Event Discovery:**

- **Auto-hide past events**: Past events are automatically hidden from public views
- **Event sharing**: Full social media sharing support
- **Slug-based URLs**: Events accessible via SEO-friendly URLs
- **Multiple view endpoints**: Dedicated endpoints for different view types

### **Event Sharing Features:**

- **Social Media Integration**: Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email
- **Shareable Links**: Generate clean URLs for events
- **Copy-to-clipboard**: Easy text sharing
- **Analytics Tracking**: Track sharing events across platforms

### **View Endpoints:**

- `GET /api/events` - List view with view parameter
- `GET /api/events/calendar` - Calendar view with date grouping
- `GET /api/events/grid` - Grid view optimized for cards
- `GET /api/events/slug/:slug` - Event by slug for sharing
- `GET /api/sharing/events/:id/share` - Complete sharing data

### **Query Parameters for Views:**

- `view`: View type (list, grid, calendar)
- `hidePast`: Hide past events (default: true)
- `startDate`/`endDate`: Date range filtering
- `category`: Category filtering
- `search`: Text search across title/description
- `sortBy`/`sortOrder`: Sorting options

---

## 🛠️ **Utility Endpoints**

### 72. Get System Health

- **GET** `/api/utils/health`
- **Description**: Get detailed system health
- **Authentication**: None required

### 73. Get System Stats

- **GET** `/api/utils/stats`
- **Description**: Get public system statistics
- **Authentication**: None required

### 74. Get System Info (Admin)

- **GET** `/api/utils/system`
- **Description**: Get detailed system information
- **Authentication**: Required (Admin only)

---

## 📝 **Common Query Parameters**

Most list endpoints support these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term
- `sortBy`: Sort field (varies by endpoint)
- `sortOrder`: Sort order (asc, desc)

## 🔒 **Authentication Levels**

- **None**: No authentication required
- **Required**: JWT token required
- **Admin**: JWT token + admin role required

## 📊 **Response Format**

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## ❌ **Error Format**

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "statusCode": 400
}
```

---

## 🚀 **Quick Start Testing**

1. **Start the server**: `pnpm run dev`
2. **Test health**: `GET http://localhost:3000/health`
3. **Add user to whitelist (admin)**: `POST http://localhost:3000/api/admin/whitelist`
4. **Google OAuth for organizer**: `GET http://localhost:3000/api/auth/google/organizer`
5. **Google OAuth for admin**: `GET http://localhost:3000/api/auth/google/admin`
6. **Get events (list view)**: `GET http://localhost:3000/api/events`
7. **Get events (calendar view)**: `GET http://localhost:3000/api/events/calendar`
8. **Get events (grid view)**: `GET http://localhost:3000/api/events/grid`
9. **Create event (organizer)**: `POST http://localhost:3000/api/events`
10. **View pending events (admin)**: `GET http://localhost:3000/api/admin/events/pending`
11. **Approve event (admin)**: `PATCH http://localhost:3000/api/admin/events/:id/approve`
12. **Get event sharing data**: `GET http://localhost:3000/api/sharing/events/:id/share`
13. **Create pencil hold (organizer)**: `POST http://localhost:3000/api/pencil-holds`
14. **Confirm pencil hold (organizer)**: `PATCH http://localhost:3000/api/pencil-holds/:id/confirm`
15. **Approve pencil hold (admin)**: `PATCH http://localhost:3000/api/pencil-holds/:id/approve`

## 📋 **Testing Tools**

- **Postman**: Import the endpoints above
- **curl**: Use the examples provided
- **Thunder Client**: VS Code extension
- **Insomnia**: API testing tool

---

_This documentation covers all available endpoints in the Kiwi Sri Lankans Events API. For additional help or questions, please refer to the source code or contact the development team._
