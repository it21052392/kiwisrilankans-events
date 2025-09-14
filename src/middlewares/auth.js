import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};

// Verify refresh token
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
      });
    }

    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Refresh token verification error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};
