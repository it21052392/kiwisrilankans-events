import { z } from 'zod';
import { logger } from '../config/logger.js';

// Generic validation middleware factory
export const validate = schema => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and params
      const validationResult = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation failed:', {
          errors,
          body: req.body,
          query: req.query,
          params: req.params,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Replace request data with validated data
      req.body = validationResult.data.body || req.body;
      req.query = validationResult.data.query || req.query;
      req.params = validationResult.data.params || req.params;

      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);

      return res.status(500).json({
        success: false,
        message: 'Validation error',
      });
    }
  };
};

// Validate request body only
export const validateBody = schema => {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse(req.body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      req.body = validationResult.data;
      next();
    } catch (error) {
      logger.error('Body validation error:', error);

      return res.status(500).json({
        success: false,
        message: 'Validation error',
      });
    }
  };
};

// Validate query parameters only
export const validateQuery = schema => {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse(req.query);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors,
        });
      }

      req.query = validationResult.data;
      next();
    } catch (error) {
      logger.error('Query validation error:', error);

      return res.status(500).json({
        success: false,
        message: 'Validation error',
      });
    }
  };
};

// Validate URL parameters only
export const validateParams = schema => {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse(req.params);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors,
        });
      }

      req.params = validationResult.data;
      next();
    } catch (error) {
      logger.error('Params validation error:', error);

      return res.status(500).json({
        success: false,
        message: 'Validation error',
      });
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .default('10'),
  }),
  search: z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};
