import { z } from 'zod';

export const userSchemas = {
  update: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim()
        .optional(),
      email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim()
        .optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
      preferences: z
        .object({
          notifications: z
            .object({
              email: z.boolean().optional(),
              push: z.boolean().optional(),
              sms: z.boolean().optional(),
            })
            .optional(),
          privacy: z
            .object({
              profileVisibility: z
                .enum(['public', 'private', 'friends'])
                .optional(),
              showEmail: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  }),

  updateProfile: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim()
        .optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
      preferences: z
        .object({
          notifications: z
            .object({
              email: z.boolean().optional(),
              push: z.boolean().optional(),
              sms: z.boolean().optional(),
            })
            .optional(),
          privacy: z
            .object({
              profileVisibility: z
                .enum(['public', 'private', 'friends'])
                .optional(),
              showEmail: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  }),

  updateRole: z.object({
    body: z.object({
      role: z
        .enum(['user', 'moderator', 'admin'])
        .refine(val => val !== 'user', 'Cannot set role to user'),
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
      role: z.enum(['user', 'moderator', 'admin']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      sortBy: z
        .enum(['name', 'email', 'createdAt', 'lastLogin'])
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),
  }),
};
