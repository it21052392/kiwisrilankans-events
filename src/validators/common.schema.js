import { z } from 'zod';

export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .default('10'),
  }),

  search: z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  fileUpload: z.object({
    type: z
      .enum(['general', 'avatar', 'event_image', 'document', 'banner'])
      .default('general'),
    maxSize: z.number().optional(),
    allowedTypes: z.array(z.string()).optional(),
  }),

  coordinates: z.object({
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  }),

  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional(),

  url: z.string().url('Please enter a valid URL').optional(),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .optional(),

  hexColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),

  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .max(50, 'Timezone cannot exceed 50 characters')
    .optional(),

  currency: z.enum(['NZD', 'USD', 'AUD', 'EUR', 'GBP']).default('NZD'),

  status: z
    .enum(['active', 'inactive', 'pending', 'approved', 'rejected'])
    .optional(),

  role: z.enum(['user', 'moderator', 'admin']).optional(),

  booleanString: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  numberString: z
    .string()
    .transform(val => {
      const num = Number(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    })
    .optional(),

  dateString: z.string().datetime('Invalid date format').optional(),

  arrayString: z
    .string()
    .transform(val => val.split(',').map(item => item.trim()))
    .optional(),

  objectString: z
    .string()
    .transform(val => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Invalid JSON object');
      }
    })
    .optional(),
};
