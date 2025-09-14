import { z } from 'zod';

export const pencilHoldSchemas = {
  create: z.object({
    body: z.object({
      eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
      notes: z
        .string()
        .max(500, 'Notes cannot exceed 500 characters')
        .trim()
        .optional(),
      additionalInfo: z.record(z.any()).optional(),
      priority: z
        .number()
        .int('Priority must be an integer')
        .min(0, 'Priority cannot be negative')
        .max(10, 'Priority cannot exceed 10')
        .default(0),
      expiresAt: z
        .string()
        .datetime('Invalid expiration date format')
        .optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      notes: z
        .string()
        .max(500, 'Notes cannot exceed 500 characters')
        .trim()
        .optional(),
      additionalInfo: z.record(z.any()).optional(),
      priority: z
        .number()
        .int('Priority must be an integer')
        .min(0, 'Priority cannot be negative')
        .max(10, 'Priority cannot exceed 10')
        .optional(),
      expiresAt: z
        .string()
        .datetime('Invalid expiration date format')
        .optional(),
    }),
  }),

  cancel: z.object({
    body: z.object({
      reason: z
        .string()
        .min(1, 'Cancellation reason is required')
        .max(200, 'Cancellation reason cannot exceed 200 characters')
        .trim(),
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
      status: z
        .enum(['pending', 'confirmed', 'cancelled', 'expired'])
        .optional(),
      eventId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID')
        .optional(),
    }),
  }),
};
