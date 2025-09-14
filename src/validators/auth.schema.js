import { z } from 'zod';

export const authSchemas = {
  // Role validation for Google OAuth
  role: z.object({
    query: z.object({
      role: z.enum(['organizer', 'admin'], {
        errorMap: () => ({ message: 'Role must be either organizer or admin' }),
      }),
    }),
  }),

  refreshToken: z.object({
    cookies: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  }),
};
