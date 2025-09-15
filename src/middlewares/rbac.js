import { logger } from '../config/logger.js';

// Role-based access control middleware
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied for user ${req.user.email} with role ${req.user.role}. Required roles: ${roles.join(', ')}`
      );

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Admin only access
export const requireAdmin = requireRole('admin');

// Admin or Moderator access
export const requireAdminOrModerator = requireRole('admin', 'moderator');

// Admin or Organizer access
export const requireAdminOrOrganizer = requireRole('admin', 'organizer');

// Owner or Admin access (for resource ownership)
export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (
      resourceUserId &&
      resourceUserId.toString() === req.user._id.toString()
    ) {
      return next();
    }

    logger.warn(
      `Access denied for user ${req.user.email}. Resource owner: ${resourceUserId}`
    );

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  };
};

// Check if user is active
export const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated',
    });
  }

  next();
};

// Check if user has verified email
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
    });
  }

  next();
};
