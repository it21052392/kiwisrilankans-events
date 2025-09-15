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
        const errors = (validationResult.error?.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input,
        }));

        logger.warn('Validation failed:', {
          errors,
          body: req.body,
          query: req.query,
          params: req.params,
          url: req.url,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
          },
        });
      }

      // Replace request data with validated data
      if (validationResult.data.body) {
        Object.assign(req.body, validationResult.data.body);
      }
      if (validationResult.data.query) {
        Object.assign(req.query, validationResult.data.query);
      }
      if (validationResult.data.params) {
        Object.assign(req.params, validationResult.data.params);
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        query: req.query,
        params: req.params,
        url: req.url,
      });

      return res.status(500).json({
        success: false,
        message: 'Validation processing error',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal validation error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  };
};

// Validate request body only
export const validateBody = schema => {
  return (req, res, next) => {
    try {
      const validationResult = schema.shape.body.safeParse(req.body);

      if (!validationResult.success) {
        const errors = (validationResult.error?.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input,
        }));

        logger.warn('Body validation failed:', {
          errors,
          body: req.body,
          url: req.url,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
          },
        });
      }

      // Replace body with validated data
      Object.assign(req.body, validationResult.data);
      next();
    } catch (error) {
      logger.error('Body validation error:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        url: req.url,
      });

      return res.status(500).json({
        success: false,
        message: 'Validation processing error',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal validation error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
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
        const errors = (validationResult.error?.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input,
        }));

        logger.warn('Query validation failed:', {
          errors,
          query: req.query,
          url: req.url,
        });

        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
          },
        });
      }

      // Replace query with validated data
      Object.assign(req.query, validationResult.data);
      next();
    } catch (error) {
      logger.error('Query validation error:', {
        error: error.message,
        stack: error.stack,
        query: req.query,
        url: req.url,
      });

      return res.status(500).json({
        success: false,
        message: 'Validation processing error',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal validation error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  };
};

// Validate URL parameters only
export const validateParams = schema => {
  return (req, res, next) => {
    try {
      // If schema has a shape property, it's a nested schema, otherwise it's a direct schema
      const validationResult = schema.shape
        ? schema.safeParse(req.params)
        : schema.safeParse(req.params.id);

      if (!validationResult.success) {
        const errors = (validationResult.error?.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input,
        }));

        logger.warn('Parameter validation failed:', {
          errors,
          params: req.params,
          url: req.url,
        });

        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
          },
        });
      }

      // Replace params with validated data
      Object.assign(req.params, validationResult.data);
      next();
    } catch (error) {
      logger.error('Params validation error:', {
        error: error.message,
        stack: error.stack,
        params: req.params,
        url: req.url,
      });

      return res.status(500).json({
        success: false,
        message: 'Validation processing error',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal validation error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
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
