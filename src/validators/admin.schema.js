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

export const adminSchemas = {
  updateRole: z.object({
    body: z.object({
      role: z
        .enum(['user', 'moderator', 'admin'])
        .refine(val => val !== 'user', 'Cannot set role to user'),
    }),
  }),

  bulkNotification: z.object({
    body: z
      .object({
        title: z
          .string()
          .min(1, 'Title is required')
          .max(100, 'Title cannot exceed 100 characters')
          .trim(),
        message: z
          .string()
          .min(1, 'Message is required')
          .max(1000, 'Message cannot exceed 1000 characters')
          .trim(),
        type: z.enum(['email', 'push', 'sms', 'all']).default('email'),
        targetUsers: z
          .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'))
          .min(1, 'At least one target user is required')
          .optional(),
        targetRoles: z
          .array(z.enum(['user', 'moderator', 'admin']))
          .min(1, 'At least one target role is required')
          .optional(),
        scheduledAt: z
          .string()
          .refine(val => {
            if (!val) return true;
            const fullDateTimeRegex =
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[+-]\d{2}:\d{2})?$/;
            const partialDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
            return (
              fullDateTimeRegex.test(val) || partialDateTimeRegex.test(val)
            );
          }, 'Invalid scheduled date format - must be YYYY-MM-DDTHH:MM or full ISO datetime')
          .optional(),
      })
      .refine(
        data => data.targetUsers || data.targetRoles,
        'Either targetUsers or targetRoles must be specified'
      ),
  }),

  getLogs: z.object({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z
        .string()
        .transform(Number)
        .pipe(z.number().min(1).max(100))
        .default('50'),
      level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
      startDate: flexibleDateTime(
        'Invalid start date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      endDate: flexibleDateTime(
        'Invalid end date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      search: z.string().optional(),
    }),
  }),

  getStats: z.object({
    query: z.object({
      period: z.enum(['day', 'week', 'month', 'year']).default('month'),
      startDate: flexibleDateTime(
        'Invalid start date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      endDate: flexibleDateTime(
        'Invalid end date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
    }),
  }),

  exportData: z.object({
    query: z.object({
      type: z
        .enum(['users', 'events', 'categories', 'subscriptions', 'pencilHolds'])
        .default('users'),
      format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
      startDate: flexibleDateTime(
        'Invalid start date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      endDate: flexibleDateTime(
        'Invalid end date format - must be YYYY-MM-DDTHH:MM or full ISO datetime'
      ).optional(),
      filters: z
        .string()
        .transform(val => {
          try {
            return JSON.parse(val);
          } catch {
            return {};
          }
        })
        .optional(),
    }),
  }),

  systemSettings: z.object({
    body: z.object({
      maintenanceMode: z.boolean().optional(),
      registrationEnabled: z.boolean().optional(),
      eventCreationEnabled: z.boolean().optional(),
      maxFileSize: z
        .number()
        .min(1024)
        .max(50 * 1024 * 1024)
        .optional(),
      allowedFileTypes: z.array(z.string()).optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      rateLimiting: z
        .object({
          enabled: z.boolean().optional(),
          windowMs: z.number().min(1000).optional(),
          maxRequests: z.number().min(1).optional(),
        })
        .optional(),
    }),
  }),

  backup: z.object({
    query: z.object({
      type: z.enum(['full', 'incremental']).default('full'),
      collections: z.array(z.string()).optional(),
      compress: z.boolean().default(true),
    }),
  }),

  restore: z.object({
    body: z.object({
      backupId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid backup ID'),
      collections: z.array(z.string()).optional(),
      confirm: z
        .boolean()
        .refine(val => val === true, 'Restore confirmation is required'),
    }),
  }),

  rejectEvent: z.object({
    body: z.object({
      reason: z
        .string()
        .min(1, 'Rejection reason is required')
        .max(500, 'Rejection reason cannot exceed 500 characters')
        .trim(),
    }),
  }),
};
