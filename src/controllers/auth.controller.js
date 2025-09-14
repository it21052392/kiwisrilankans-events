import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await authService.register({ name, email, password });

  logger.info(`User registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password
  );

  logger.info(`User logged in: ${user.email}`);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const authUrl = await authService.getGoogleAuthUrl();
  res.redirect(authUrl);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  const { user, accessToken, refreshToken } =
    await authService.handleGoogleCallback(code);

  logger.info(`User logged in via Google: ${user.email}`);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
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
  register,
  login,
  googleAuth,
  googleCallback,
  refreshToken,
  logout,
  getMe,
};
