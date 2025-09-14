import { z } from 'zod';

export const categorySchemas = {
  create: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name cannot exceed 50 characters')
        .trim(),
      description: z
        .string()
        .max(200, 'Description cannot exceed 200 characters')
        .trim()
        .optional(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
        .default('#3B82F6'),
      icon: z
        .string()
        .max(50, 'Icon name cannot exceed 50 characters')
        .default('calendar'),
      sortOrder: z
        .number()
        .int('Sort order must be an integer')
        .min(0, 'Sort order cannot be negative')
        .default(0),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name cannot exceed 50 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .max(200, 'Description cannot exceed 200 characters')
        .trim()
        .optional(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
        .optional(),
      icon: z
        .string()
        .max(50, 'Icon name cannot exceed 50 characters')
        .optional(),
      active: z.boolean().optional(),
      sortOrder: z
        .number()
        .int('Sort order must be an integer')
        .min(0, 'Sort order cannot be negative')
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
      active: z
        .string()
        .transform(val => val === 'true')
        .optional(),
    }),
  }),
};
