import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
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
    }),
  }),

  login: z.object({
    body: z.object({
      email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  refreshToken: z.object({
    cookies: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Reset token is required'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    }),
  }),

  verifyEmail: z.object({
    body: z.object({
      token: z.string().min(1, 'Verification token is required'),
    }),
  }),

  resendVerification: z.object({
    body: z.object({
      email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    }),
  }),
};
