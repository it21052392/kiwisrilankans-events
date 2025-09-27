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

export const uploadSchemas = {
  uploadSingle: z.object({
    body: z.object({
      type: z
        .enum(['general', 'avatar', 'event_image', 'document', 'banner'])
        .default('general'),
    }),
  }),

  uploadMultiple: z.object({
    body: z.object({
      type: z
        .enum(['general', 'avatar', 'event_image', 'document', 'banner'])
        .default('general'),
      maxFiles: z.number().min(1).max(10).default(5).optional(),
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
      type: z
        .enum(['general', 'avatar', 'event_image', 'document', 'banner'])
        .optional(),
      userId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
        .optional(),
      startDate: flexibleDateTime(
        'Invalid start date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      endDate: flexibleDateTime(
        'Invalid end date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      sortBy: z
        .enum(['filename', 'originalName', 'size', 'uploadedAt'])
        .default('uploadedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),
  }),

  fileValidation: z.object({
    maxSize: z
      .number()
      .min(1024, 'Max size must be at least 1KB')
      .max(50 * 1024 * 1024, 'Max size cannot exceed 50MB')
      .default(10 * 1024 * 1024), // 10MB default
    allowedTypes: z
      .array(z.string())
      .min(1, 'At least one file type must be allowed')
      .default(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt']),
    maxFiles: z
      .number()
      .min(1, 'Max files must be at least 1')
      .max(20, 'Max files cannot exceed 20')
      .default(5),
  }),

  imageValidation: z.object({
    maxSize: z
      .number()
      .min(1024, 'Max size must be at least 1KB')
      .max(10 * 1024 * 1024, 'Max size cannot exceed 10MB')
      .default(5 * 1024 * 1024), // 5MB default
    allowedTypes: z
      .array(z.string())
      .default(['jpg', 'jpeg', 'png', 'gif', 'webp']),
    dimensions: z
      .object({
        minWidth: z.number().min(1).default(100),
        maxWidth: z.number().min(1).default(4000),
        minHeight: z.number().min(1).default(100),
        maxHeight: z.number().min(1).default(4000),
      })
      .optional(),
  }),

  documentValidation: z.object({
    maxSize: z
      .number()
      .min(1024, 'Max size must be at least 1KB')
      .max(20 * 1024 * 1024, 'Max size cannot exceed 20MB')
      .default(10 * 1024 * 1024), // 10MB default
    allowedTypes: z
      .array(z.string())
      .default(['pdf', 'doc', 'docx', 'txt', 'rtf']),
  }),

  avatarValidation: z.object({
    maxSize: z
      .number()
      .min(1024, 'Max size must be at least 1KB')
      .max(2 * 1024 * 1024, 'Max size cannot exceed 2MB')
      .default(2 * 1024 * 1024), // 2MB default
    allowedTypes: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'gif']),
    dimensions: z.object({
      width: z.number().min(100).max(2000).default(200),
      height: z.number().min(100).max(2000).default(200),
    }),
  }),
};
