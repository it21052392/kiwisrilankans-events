// Application constants
export const APP_CONSTANTS = {
  NAME: 'Kiwi Sri Lankans Events',
  VERSION: '1.0.0',
  DESCRIPTION: 'Event management platform for the Kiwi Sri Lankan community',
  AUTHOR: 'Kiwi Sri Lankans Team',
  CONTACT_EMAIL: 'admin@kiwisrilankans.org',
  SUPPORT_EMAIL: 'admin@kiwisrilankans.org',
  PHONE: '+64 20 470 4707',
  ADDRESS: '1/24, Headcorn Place, Botany Downs, Auckland 2010, New Zealand',
  ORGANIZATION: 'Kiwi Sri Lankans',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// Event statuses
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  UNPUBLISHED: 'unpublished',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  DELETED: 'deleted',
};

// Event status based on dates
export const EVENT_DATE_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Pencil hold statuses
export const PENCIL_HOLD_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CONVERTED: 'converted',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

// File upload types
export const UPLOAD_TYPES = {
  GENERAL: 'general',
  AVATAR: 'avatar',
  EVENT_IMAGE: 'event_image',
  DOCUMENT: 'document',
  BANNER: 'banner',
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
  ALL: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'],
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AVATAR: 2 * 1024 * 1024, // 2MB
  MAX: 10 * 1024 * 1024, // 10MB
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Sort orders
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

// Common sort fields
export const SORT_FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
  TITLE: 'title',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  PRICE: 'price',
  CAPACITY: 'capacity',
};

// Cache keys
export const CACHE_KEYS = {
  EVENTS: 'events',
  CATEGORIES: 'categories',
  USERS: 'users',
  STATS: 'stats',
  FEATURED_EVENTS: 'featured_events',
  UPCOMING_EVENTS: 'upcoming_events',
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Rate limiting
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
  },
};

// Database collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  CATEGORIES: 'categories',
  PENCIL_HOLDS: 'pencilholds',
  UPLOADS: 'uploads',
  SESSIONS: 'sessions',
  LOGS: 'logs',
};

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

// Success messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully',
  EVENT_REGISTERED: 'Successfully registered for event',
  REGISTRATION_CANCELLED: 'Event registration cancelled successfully',
  PENCIL_HOLD_CREATED: 'Pencil hold created successfully',
  PENCIL_HOLD_UPDATED: 'Pencil hold updated successfully',
  PENCIL_HOLD_DELETED: 'Pencil hold deleted successfully',
  PENCIL_HOLD_CONFIRMED: 'Pencil hold confirmed successfully',
  PENCIL_HOLD_CANCELLED: 'Pencil hold cancelled successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
};

// Error messages
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  EVENT_NOT_FOUND: 'Event not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  PENCIL_HOLD_NOT_FOUND: 'Pencil hold not found',
  FILE_NOT_FOUND: 'File not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCESS_DENIED: 'Access denied',
  VALIDATION_FAILED: 'Validation failed',
  DUPLICATE_ENTRY: 'Entry already exists',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  FILE_TOO_LARGE: 'File too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  DATABASE_ERROR: 'Database error occurred',
  EXTERNAL_SERVICE_ERROR: 'External service error',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};
