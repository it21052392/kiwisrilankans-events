import { logger } from '../config/logger.js';

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Success response helper
export const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = HTTP_STATUS.OK
) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response helper
export const errorResponse = (
  res,
  message = 'Error',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
export const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10,
    skip:
      ((pageNum > 0 ? pageNum : 1) - 1) *
      (limitNum > 0 && limitNum <= 100 ? limitNum : 10),
  };
};

// Pagination response helper
export const paginatedResponse = (data, pagination, total) => {
  return {
    ...data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page < Math.ceil(total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  };
};

// API response wrapper
export const apiResponse = (res, result) => {
  if (result.success) {
    return successResponse(res, result.data, result.message, result.statusCode);
  } else {
    return errorResponse(res, result.message, result.statusCode, result.errors);
  }
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Rate limit helper
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// CORS configuration
export const corsConfig = {
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      callback(null, true);
    } else {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Health check response
export const healthCheck = (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  return successResponse(res, healthData, 'Service is healthy');
};

// Error handler for async functions
export const catchAsync = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Validation error formatter
export const formatValidationErrors = errors => {
  return errors.map(error => ({
    field: error.path?.join('.') || 'unknown',
    message: error.message,
    value: error.value,
  }));
};

// Database error handler
export const handleDatabaseError = error => {
  if (error.name === 'ValidationError') {
    return {
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      })),
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      success: false,
      message: `${field} already exists`,
      statusCode: HTTP_STATUS.CONFLICT,
    };
  }

  if (error.name === 'CastError') {
    return {
      success: false,
      message: 'Invalid ID format',
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  return {
    success: false,
    message: 'Database error',
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  };
};
