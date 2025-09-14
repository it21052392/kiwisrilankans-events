# Kiwi Sri Lankans Events API Documentation

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

### 4. User Registration

- **POST** `/api/auth/register`
- **Description**: Register a new user
- **Authentication**: None required
- **Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 5. User Login

- **POST** `/api/auth/login`
- **Description**: Login user and get JWT token
- **Authentication**: None required
- **Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 6. Google OAuth

- **GET** `/api/auth/google`
- **Description**: Initiate Google OAuth flow
- **Authentication**: None required

### 7. Google OAuth Callback

- **GET** `/api/auth/google/callback`
- **Description**: Handle Google OAuth callback
- **Authentication**: None required

### 8. Refresh Token

- **POST** `/api/auth/refresh`
- **Description**: Refresh JWT token
- **Authentication**: None required
- **Request Body** (cookies):

```json
{
  "refreshToken": "your-refresh-token"
}
```

### 9. Logout

- **POST** `/api/auth/logout`
- **Description**: Logout user
- **Authentication**: Required

### 10. Get Current User

- **GET** `/api/auth/me`
- **Description**: Get current user profile
- **Authentication**: Required

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

### 16. Change Password

- **PUT** `/api/users/change-password`
- **Description**: Change user password
- **Authentication**: Required
- **Request Body**:

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

## 🎯 **Event Management Endpoints**

### 17. Get All Events

- **GET** `/api/events`
- **Description**: Get paginated list of events
- **Authentication**: None required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `category` (optional): Category ID
  - `status` (optional): Event status (draft, published, cancelled, completed)
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
  - `sortBy` (optional): Sort field (startDate, endDate, title, createdAt, price, capacity)
  - `sortOrder` (optional): Sort order (asc, desc)

### 18. Get Event by ID

- **GET** `/api/events/:id`
- **Description**: Get specific event details
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 19. Create Event (Admin)

- **POST** `/api/events`
- **Description**: Create new event
- **Authentication**: Required (Admin only)
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
- **Description**: Delete event
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 22. Register for Event

- **POST** `/api/events/:id/register`
- **Description**: Register for an event
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "additionalInfo": {
    "dietaryRequirements": "Vegetarian",
    "emergencyContact": "+64 21 987 6543"
  }
}
```

### 23. Cancel Event Registration

- **DELETE** `/api/events/:id/register`
- **Description**: Cancel event registration
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)

### 24. Get Event Registrations (Admin)

- **GET** `/api/events/:id/registrations`
- **Description**: Get event registrations
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Event ID (MongoDB ObjectId)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

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
- **Authentication**: None required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `status` (optional): Hold status (pending, confirmed, cancelled, expired)
  - `eventId` (optional): Filter by event ID

### 32. Get Pencil Hold by ID

- **GET** `/api/pencil-holds/:id`
- **Description**: Get specific pencil hold details
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)

### 33. Create Pencil Hold

- **POST** `/api/pencil-holds`
- **Description**: Create new pencil hold
- **Authentication**: Required
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
- **Authentication**: Required
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
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)

### 36. Get My Pencil Holds

- **GET** `/api/pencil-holds/my-holds`
- **Description**: Get current user's pencil holds
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 37. Confirm Pencil Hold (Admin)

- **PATCH** `/api/pencil-holds/:id/confirm`
- **Description**: Confirm pencil hold
- **Authentication**: Required (Admin only)
- **Path Parameters**:
  - `id`: Pencil Hold ID (MongoDB ObjectId)

### 38. Cancel Pencil Hold (Admin)

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

## 🔔 **Subscription Management Endpoints**

### 39. Subscribe to Notifications

- **POST** `/api/subscriptions`
- **Description**: Subscribe to notifications
- **Authentication**: Required
- **Request Body**:

```json
{
  "type": "email",
  "preferences": {
    "eventReminders": true,
    "eventUpdates": true,
    "weeklyDigest": false,
    "newEvents": true,
    "categorySpecific": [
      {
        "category": "64a1b2c3d4e5f6789012345",
        "enabled": true
      }
    ]
  }
}
```

### 40. Unsubscribe

- **DELETE** `/api/subscriptions/:id`
- **Description**: Unsubscribe from notifications
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Subscription ID (MongoDB ObjectId)

### 41. Get My Subscriptions

- **GET** `/api/subscriptions/my-subscriptions`
- **Description**: Get current user's subscriptions
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

### 42. Update Subscription Preferences

- **PUT** `/api/subscriptions/:id/preferences`
- **Description**: Update subscription preferences
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Subscription ID (MongoDB ObjectId)
- **Request Body**:

```json
{
  "preferences": {
    "eventReminders": false,
    "eventUpdates": true,
    "weeklyDigest": true,
    "newEvents": false
  }
}
```

### 43. Subscribe to Push Notifications

- **POST** `/api/subscriptions/push`
- **Description**: Subscribe to push notifications
- **Authentication**: Required
- **Request Body**:

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa40HI...",
      "auth": "tBHItJI5svbpez7KI4CCXg=="
    }
  }
}
```

### 44. Unsubscribe from Push Notifications

- **DELETE** `/api/subscriptions/push/:id`
- **Description**: Unsubscribe from push notifications
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Push subscription ID (MongoDB ObjectId)

### 45. Get All Subscriptions (Admin)

- **GET** `/api/subscriptions`
- **Description**: Get all subscriptions
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `type` (optional): Subscription type (email, push, sms, all)
  - `status` (optional): Subscription status (active, paused, cancelled)

### 46. Send Test Notification (Admin)

- **POST** `/api/subscriptions/test`
- **Description**: Send test notification
- **Authentication**: Required (Admin only)
- **Request Body**:

```json
{
  "type": "email",
  "message": "This is a test notification",
  "targetUsers": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"]
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

---

## 🛠️ **Utility Endpoints**

### 64. Get System Health

- **GET** `/api/utils/health`
- **Description**: Get detailed system health
- **Authentication**: None required

### 65. Get System Stats

- **GET** `/api/utils/stats`
- **Description**: Get public system statistics
- **Authentication**: None required

### 66. Get System Info (Admin)

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
3. **Register user**: `POST http://localhost:3000/api/auth/register`
4. **Login**: `POST http://localhost:3000/api/auth/login`
5. **Get events**: `GET http://localhost:3000/api/events`

## 📋 **Testing Tools**

- **Postman**: Import the endpoints above
- **curl**: Use the examples provided
- **Thunder Client**: VS Code extension
- **Insomnia**: API testing tool

---

_This documentation covers all available endpoints in the Kiwi Sri Lankans Events API. For additional help or questions, please refer to the source code or contact the development team._
