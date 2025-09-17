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
        const errors = (validationResult.error?.issues || []).map(err => {
          const fieldPath = err.path.join('.');
          const fieldName = err.path[err.path.length - 1];

          return {
            field: fieldPath,
            fieldName: fieldName,
            message: err.message,
            code: err.code,
            received: err.input,
            expected: err.expected,
            receivedType: typeof err.input,
            path: err.path,
            // Add more specific error details based on the error code
            ...(err.code === 'invalid_type' && {
              expectedType: err.expected,
              receivedType: err.received,
            }),
            ...(err.code === 'too_small' && {
              minimum: err.minimum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'too_big' && {
              maximum: err.maximum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'invalid_string' && {
              validation: err.validation,
            }),
            ...(err.code === 'invalid_enum_value' && {
              options: err.options,
            }),
            ...(err.code === 'invalid_regex' && {
              regex: err.regex,
            }),
          };
        });

        // Group errors by field for better organization
        const errorsByField = errors.reduce((acc, error) => {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field].push(error);
          return acc;
        }, {});

        logger.warn('Validation failed:', {
          errors,
          errorsByField,
          body: req.body,
          query: req.query,
          params: req.params,
          url: req.url,
          method: req.method,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          errorsByField,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
            fieldCount: Object.keys(errorsByField).length,
            validationSummary: Object.keys(errorsByField).map(field => ({
              field,
              errorCount: errorsByField[field].length,
              firstError: errorsByField[field][0].message,
            })),
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
        method: req.method,
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
      // Add debugging information
      logger.debug('Validating request body:', {
        body: req.body,
        schemaKeys: Object.keys(schema.shape || {}),
        url: req.url,
        method: req.method,
      });

      const validationResult = schema.shape.body.safeParse(req.body);

      if (!validationResult.success) {
        const errors = (validationResult.error?.issues || []).map(err => {
          const fieldPath = err.path.join('.');
          const fieldName = err.path[err.path.length - 1];

          return {
            field: fieldPath,
            fieldName: fieldName,
            message: err.message,
            code: err.code,
            received: err.input,
            expected: err.expected,
            receivedType: typeof err.input,
            path: err.path,
            // Add more specific error details based on the error code
            ...(err.code === 'invalid_type' && {
              expectedType: err.expected,
              receivedType: err.received,
            }),
            ...(err.code === 'too_small' && {
              minimum: err.minimum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'too_big' && {
              maximum: err.maximum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'invalid_string' && {
              validation: err.validation,
            }),
            ...(err.code === 'invalid_enum_value' && {
              options: err.options,
            }),
            ...(err.code === 'invalid_regex' && {
              regex: err.regex,
            }),
          };
        });

        // Group errors by field for better organization
        const errorsByField = errors.reduce((acc, error) => {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field].push(error);
          return acc;
        }, {});

        logger.warn('Body validation failed:', {
          errors,
          errorsByField,
          body: req.body,
          url: req.url,
          method: req.method,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          errorsByField,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
            fieldCount: Object.keys(errorsByField).length,
            validationSummary: Object.keys(errorsByField).map(field => ({
              field,
              errorCount: errorsByField[field].length,
              firstError: errorsByField[field][0].message,
            })),
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
        method: req.method,
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
        const errors = (validationResult.error?.issues || []).map(err => {
          const fieldPath = err.path.join('.');
          const fieldName = err.path[err.path.length - 1];

          return {
            field: fieldPath,
            fieldName: fieldName,
            message: err.message,
            code: err.code,
            received: err.input,
            expected: err.expected,
            receivedType: typeof err.input,
            path: err.path,
            // Add more specific error details based on the error code
            ...(err.code === 'invalid_type' && {
              expectedType: err.expected,
              receivedType: err.received,
            }),
            ...(err.code === 'too_small' && {
              minimum: err.minimum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'too_big' && {
              maximum: err.maximum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'invalid_string' && {
              validation: err.validation,
            }),
            ...(err.code === 'invalid_enum_value' && {
              options: err.options,
            }),
            ...(err.code === 'invalid_regex' && {
              regex: err.regex,
            }),
          };
        });

        // Group errors by field for better organization
        const errorsByField = errors.reduce((acc, error) => {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field].push(error);
          return acc;
        }, {});

        logger.warn('Query validation failed:', {
          errors,
          errorsByField,
          query: req.query,
          url: req.url,
          method: req.method,
        });

        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors,
          errorsByField,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
            fieldCount: Object.keys(errorsByField).length,
            validationSummary: Object.keys(errorsByField).map(field => ({
              field,
              errorCount: errorsByField[field].length,
              firstError: errorsByField[field][0].message,
            })),
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
        method: req.method,
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
        const errors = (validationResult.error?.issues || []).map(err => {
          const fieldPath = err.path.join('.');
          const fieldName = err.path[err.path.length - 1];

          return {
            field: fieldPath,
            fieldName: fieldName,
            message: err.message,
            code: err.code,
            received: err.input,
            expected: err.expected,
            receivedType: typeof err.input,
            path: err.path,
            // Add more specific error details based on the error code
            ...(err.code === 'invalid_type' && {
              expectedType: err.expected,
              receivedType: err.received,
            }),
            ...(err.code === 'too_small' && {
              minimum: err.minimum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'too_big' && {
              maximum: err.maximum,
              inclusive: err.inclusive,
            }),
            ...(err.code === 'invalid_string' && {
              validation: err.validation,
            }),
            ...(err.code === 'invalid_enum_value' && {
              options: err.options,
            }),
            ...(err.code === 'invalid_regex' && {
              regex: err.regex,
            }),
          };
        });

        // Group errors by field for better organization
        const errorsByField = errors.reduce((acc, error) => {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field].push(error);
          return acc;
        }, {});

        logger.warn('Parameter validation failed:', {
          errors,
          errorsByField,
          params: req.params,
          url: req.url,
          method: req.method,
        });

        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors,
          errorsByField,
          details: {
            totalErrors: errors.length,
            fields: errors.map(e => e.field),
            fieldCount: Object.keys(errorsByField).length,
            validationSummary: Object.keys(errorsByField).map(field => ({
              field,
              errorCount: errorsByField[field].length,
              firstError: errorsByField[field][0].message,
            })),
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
        method: req.method,
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
