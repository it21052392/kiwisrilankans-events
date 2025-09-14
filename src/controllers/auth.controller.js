import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

// @desc    Google OAuth for Organizer registration/login
// @route   GET /api/auth/google/organizer
// @access  Public
const googleAuthOrganizer = asyncHandler(async (req, res) => {
  try {
    const authUrl = await authService.getGoogleAuthUrl('organizer');
    logger.info(`Generated auth URL: ${authUrl}`);
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google auth URL',
      error: error.message,
    });
  }
});

// @desc    Google OAuth for Admin registration/login
// @route   GET /api/auth/google/admin
// @access  Public
const googleAuthAdmin = asyncHandler(async (req, res) => {
  try {
    const authUrl = await authService.getGoogleAuthUrl('admin');
    logger.info(`Generated auth URL: ${authUrl}`);
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google auth URL',
      error: error.message,
    });
  }
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res
      .status(400)
      .redirect(`${process.env.FRONTEND_URL}?error=missing_parameters`);
  }

  const { user, accessToken, refreshToken } =
    await authService.handleGoogleCallback(code, state);

  logger.info(
    `User logged in via Google: ${user.email} with role: ${user.role}`
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Redirect to frontend with token and role
  res.redirect(
    `${process.env.FRONTEND_URL}?token=${accessToken}&role=${user.role}`
  );
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not provided',
    });
  }

  const { accessToken, user } =
    await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');

  logger.info(`User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    },
  });
});

export {
  googleAuthOrganizer,
  googleAuthAdmin,
  googleCallback,
  refreshToken,
  logout,
  getMe,
};
