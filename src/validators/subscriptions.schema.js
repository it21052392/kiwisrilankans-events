import { z } from 'zod';

export const subscriptionSchemas = {
  subscribe: z.object({
    body: z.object({
      type: z.enum(['email', 'push', 'sms', 'all']).default('email'),
      preferences: z
        .object({
          eventReminders: z.boolean().default(true),
          eventUpdates: z.boolean().default(true),
          weeklyDigest: z.boolean().default(true),
          newEvents: z.boolean().default(true),
          categorySpecific: z
            .array(
              z.object({
                category: z
                  .string()
                  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
                enabled: z.boolean().default(true),
              })
            )
            .optional(),
        })
        .optional(),
    }),
  }),

  updatePreferences: z.object({
    body: z.object({
      preferences: z.object({
        eventReminders: z.boolean().optional(),
        eventUpdates: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
        newEvents: z.boolean().optional(),
        categorySpecific: z
          .array(
            z.object({
              category: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
              enabled: z.boolean(),
            })
          )
          .optional(),
      }),
    }),
  }),

  pushSubscribe: z.object({
    body: z.object({
      subscription: z.object({
        endpoint: z.string().url('Invalid push subscription endpoint'),
        keys: z.object({
          p256dh: z.string().min(1, 'P256DH key is required'),
          auth: z.string().min(1, 'Auth key is required'),
        }),
      }),
    }),
  }),

  testNotification: z.object({
    body: z.object({
      type: z.enum(['email', 'push', 'sms']),
      message: z
        .string()
        .min(1, 'Message is required')
        .max(500, 'Message cannot exceed 500 characters')
        .trim(),
      targetUsers: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'))
        .min(1, 'At least one target user is required'),
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
      type: z.enum(['email', 'push', 'sms', 'all']).optional(),
      status: z.enum(['active', 'paused', 'cancelled']).optional(),
    }),
  }),
};
