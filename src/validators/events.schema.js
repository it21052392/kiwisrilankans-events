import { z } from 'zod';

// Helper function for flexible datetime validation
const flexibleDateTime = message =>
  z.string().refine(val => {
    if (!val) return true; // Allow empty/undefined for optional field
    // Accept both full ISO datetime and partial datetime formats
    const fullDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[+-]\d{2}:\d{2})?$/;
    const partialDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return fullDateTimeRegex.test(val) || partialDateTimeRegex.test(val);
  }, message);

export const eventSchemas = {
  create: z.object({
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim(),
      category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
      startDate: z.string().datetime('Invalid start date format'),
      endDate: z.string().datetime('Invalid end date format'),
      location: z.object({
        name: z
          .string()
          .min(2, 'Location name must be at least 2 characters')
          .max(100, 'Location name cannot exceed 100 characters')
          .trim(),
        address: z
          .string()
          .min(5, 'Address must be at least 5 characters')
          .max(200, 'Address cannot exceed 200 characters')
          .trim(),
        city: z
          .string()
          .min(2, 'City must be at least 2 characters')
          .max(50, 'City cannot exceed 50 characters')
          .trim(),
        coordinates: z
          .object({
            latitude: z
              .number()
              .min(-90, 'Latitude must be between -90 and 90')
              .max(90, 'Latitude must be between -90 and 90'),
            longitude: z
              .number()
              .min(-180, 'Longitude must be between -180 and 180')
              .max(180, 'Longitude must be between -180 and 180'),
          })
          .optional(),
      }),
      capacity: z
        .number()
        .min(1, 'Capacity must be at least 1')
        .max(10000, 'Capacity cannot exceed 10000'),
      price: z.number().min(0, 'Price cannot be negative'),
      currency: z.enum(['NZD', 'USD', 'AUD', 'EUR', 'GBP']).default('NZD'),
      startTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Start time must be in HH:MM format'
        )
        .optional(),
      endTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'End time must be in HH:MM format'
        )
        .optional(),
      images: z
        .array(
          z.object({
            url: z.string().refine(val => {
              // Allow blob URLs, S3 URLs, or valid HTTP/HTTPS URLs
              return (
                val.startsWith('blob:') ||
                val.includes('.s3.') ||
                val.includes('amazonaws.com') ||
                /^https?:\/\/.+/.test(val)
              );
            }, 'Invalid image URL - must be a valid HTTP/HTTPS URL, S3 URL, or blob URL'),
            alt: z
              .string()
              .max(100, 'Alt text cannot exceed 100 characters')
              .optional(),
            isPrimary: z.boolean().default(false),
          })
        )
        .max(5, 'Maximum 5 images allowed per event')
        .optional(),
      tags: z
        .array(
          z
            .string()
            .min(1, 'Tag cannot be empty')
            .max(30, 'Tag cannot exceed 30 characters')
            .trim()
        )
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
      requirements: z
        .array(
          z
            .string()
            .min(1, 'Requirement cannot be empty')
            .max(100, 'Requirement cannot exceed 100 characters')
            .trim()
        )
        .max(10, 'Maximum 10 requirements allowed')
        .optional(),
      contactInfo: z
        .object({
          name: z
            .string()
            .max(50, 'Contact name cannot exceed 50 characters')
            .trim()
            .optional(),
          email: z
            .string()
            .email('Please enter a valid email address')
            .optional(),
          phone: z
            .string()
            .max(20, 'Phone cannot exceed 20 characters')
            .trim()
            .optional(),
        })
        .optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional(),
      category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
        .optional(),
      startDate: z.string().datetime('Invalid start date format').optional(),
      endDate: z.string().datetime('Invalid end date format').optional(),
      location: z
        .object({
          name: z
            .string()
            .min(2, 'Location name must be at least 2 characters')
            .max(100, 'Location name cannot exceed 100 characters')
            .trim()
            .optional(),
          address: z
            .string()
            .min(5, 'Address must be at least 5 characters')
            .max(200, 'Address cannot exceed 200 characters')
            .trim()
            .optional(),
          city: z
            .string()
            .min(2, 'City must be at least 2 characters')
            .max(50, 'City cannot exceed 50 characters')
            .trim()
            .optional(),
          coordinates: z
            .object({
              latitude: z
                .number()
                .min(-90, 'Latitude must be between -90 and 90')
                .max(90, 'Latitude must be between -90 and 90'),
              longitude: z
                .number()
                .min(-180, 'Longitude must be between -180 and 180')
                .max(180, 'Longitude must be between -180 and 180'),
            })
            .optional(),
        })
        .optional(),
      capacity: z
        .number()
        .min(1, 'Capacity must be at least 1')
        .max(10000, 'Capacity cannot exceed 10000')
        .optional(),
      price: z.number().min(0, 'Price cannot be negative').optional(),
      currency: z.enum(['NZD', 'USD', 'AUD', 'EUR', 'GBP']).optional(),
      status: z
        .enum(['draft', 'published', 'cancelled', 'completed'])
        .optional(),
      startTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Start time must be in HH:MM format'
        )
        .optional(),
      endTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'End time must be in HH:MM format'
        )
        .optional(),
      featured: z.boolean().optional(),
      images: z
        .array(
          z.object({
            url: z.string().refine(val => {
              // Allow blob URLs, S3 URLs, or valid HTTP/HTTPS URLs
              return (
                val.startsWith('blob:') ||
                val.includes('.s3.') ||
                val.includes('amazonaws.com') ||
                /^https?:\/\/.+/.test(val)
              );
            }, 'Invalid image URL - must be a valid HTTP/HTTPS URL, S3 URL, or blob URL'),
            alt: z
              .string()
              .max(100, 'Alt text cannot exceed 100 characters')
              .optional(),
            isPrimary: z.boolean().default(false),
          })
        )
        .max(5, 'Maximum 5 images allowed per event')
        .optional(),
      tags: z
        .array(
          z
            .string()
            .min(1, 'Tag cannot be empty')
            .max(30, 'Tag cannot exceed 30 characters')
            .trim()
        )
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
      requirements: z
        .array(
          z
            .string()
            .min(1, 'Requirement cannot be empty')
            .max(100, 'Requirement cannot exceed 100 characters')
            .trim()
        )
        .max(10, 'Maximum 10 requirements allowed')
        .optional(),
      contactInfo: z
        .object({
          name: z
            .string()
            .max(50, 'Contact name cannot exceed 50 characters')
            .trim()
            .optional(),
          email: z
            .string()
            .email('Please enter a valid email address')
            .optional(),
          phone: z
            .string()
            .max(20, 'Phone cannot exceed 20 characters')
            .trim()
            .optional(),
        })
        .optional(),
    }),
  }),

  query: z.object({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z
        .string()
        .transform(Number)
        .pipe(z.number().min(1).max(100))
        .default('10'),
      search: z.string().optional(),
      category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
        .optional(),
      status: z
        .enum(['draft', 'published', 'cancelled', 'completed'])
        .optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      sortBy: z
        .enum([
          'startDate',
          'endDate',
          'title',
          'createdAt',
          'price',
          'capacity',
        ])
        .default('startDate'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }),
  }),

  // Flat query schema for direct use with validateQuery middleware
  getEventsQuery: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .default('10'),
    search: z.string().optional(),
    category: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
      .optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z
      .enum(['startDate', 'endDate', 'title', 'createdAt', 'price', 'capacity'])
      .default('startDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),

  // Organizer update schema - more restrictive than admin update
  updateByOrganizer: z.object({
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional(),
      category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
        .optional(),
      startDate: flexibleDateTime(
        'Invalid start date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      endDate: flexibleDateTime(
        'Invalid end date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      location: z
        .object({
          name: z
            .string()
            .min(2, 'Location name must be at least 2 characters')
            .max(100, 'Location name cannot exceed 100 characters')
            .trim()
            .optional(),
          address: z
            .string()
            .min(5, 'Address must be at least 5 characters')
            .max(200, 'Address cannot exceed 200 characters')
            .trim()
            .optional(),
          city: z
            .string()
            .min(2, 'City must be at least 2 characters')
            .max(50, 'City cannot exceed 50 characters')
            .trim()
            .optional(),
          coordinates: z
            .object({
              latitude: z
                .number()
                .min(-90, 'Latitude must be between -90 and 90')
                .max(90, 'Latitude must be between -90 and 90'),
              longitude: z
                .number()
                .min(-180, 'Longitude must be between -180 and 180')
                .max(180, 'Longitude must be between -180 and 180'),
            })
            .optional(),
        })
        .optional(),
      capacity: z
        .number()
        .min(1, 'Capacity must be at least 1')
        .max(10000, 'Capacity cannot exceed 10000')
        .optional(),
      price: z.number().min(0, 'Price cannot be negative').optional(),
      startTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Start time must be in HH:MM format'
        )
        .optional(),
      endTime: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'End time must be in HH:MM format'
        )
        .optional(),
      currency: z.enum(['NZD', 'USD', 'AUD', 'EUR', 'GBP']).optional(),
      // Organizers cannot change status, featured, or approval fields
      images: z
        .array(
          z.object({
            url: z.string().refine(val => {
              // Allow blob URLs, S3 URLs, or valid HTTP/HTTPS URLs
              return (
                val.startsWith('blob:') ||
                val.includes('.s3.') ||
                val.includes('amazonaws.com') ||
                /^https?:\/\/.+/.test(val)
              );
            }, 'Invalid image URL - must be a valid HTTP/HTTPS URL, S3 URL, or blob URL'),
            alt: z
              .string()
              .max(100, 'Alt text cannot exceed 100 characters')
              .optional(),
            isPrimary: z.boolean().default(false),
          })
        )
        .max(5, 'Maximum 5 images allowed per event')
        .optional(),
      tags: z
        .array(
          z
            .string()
            .min(1, 'Tag cannot be empty')
            .max(30, 'Tag cannot exceed 30 characters')
            .trim()
        )
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
      requirements: z
        .array(
          z
            .string()
            .min(1, 'Requirement cannot be empty')
            .max(100, 'Requirement cannot exceed 100 characters')
            .trim()
        )
        .max(10, 'Maximum 10 requirements allowed')
        .optional(),
      contactInfo: z
        .object({
          name: z
            .string()
            .max(50, 'Contact name cannot exceed 50 characters')
            .trim()
            .optional(),
          email: z
            .string()
            .email('Please enter a valid email address')
            .optional(),
          phone: z
            .string()
            .max(20, 'Phone cannot exceed 20 characters')
            .trim()
            .optional(),
        })
        .optional(),
    }),
  }),
};
