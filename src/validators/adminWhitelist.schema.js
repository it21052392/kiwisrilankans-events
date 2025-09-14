import { z } from 'zod';

export const adminWhitelistSchemas = {
  addEmail: z.object({
    body: z.object({
      email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    }),
  }),
};
