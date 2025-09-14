import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { AdminWhitelist } from '../models/adminWhitelist.model.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

class AuthService {
  constructor() {
    this.googleClient = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  async register({ name, email, password }) {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    return { user, accessToken, refreshToken };
  }

  async login(email, password) {
    // Find user with password
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error(
        'Account is temporarily locked due to too many failed login attempts'
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    return { user, accessToken, refreshToken };
  }

  async getGoogleAuthUrl(role) {
    // Validate role
    if (!role || !['organizer', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be either organizer or admin');
    }

    // Check if Google client is properly initialized
    if (!this.googleClient) {
      throw new Error('Google OAuth client not initialized');
    }

    logger.info(`Generating Google auth URL for role: ${role}`);
    logger.info(
      `Google Client ID: ${env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}`
    );
    logger.info(
      `Google Client Secret: ${env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'}`
    );
    logger.info(`Google Redirect URI: ${env.GOOGLE_REDIRECT_URI || 'Not set'}`);

    const authUrl = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent',
      state: role, // Pass role as state parameter
    });

    logger.info(`Generated auth URL: ${authUrl}`);
    return authUrl;
  }

  async handleGoogleCallback(code, state) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      // Extract role from state parameter
      const role = state;

      // Validate role
      if (!role || !['organizer', 'admin'].includes(role)) {
        throw new Error('Invalid role. Must be either organizer or admin');
      }

      // Check admin whitelist if trying to register as admin
      if (role === 'admin') {
        const isWhitelisted = await AdminWhitelist.isEmailWhitelisted(email);
        if (!isWhitelisted) {
          throw new Error(
            'Access denied. Your email is not authorized for admin access. Please contact an existing admin to request access.'
          );
        }
      }

      // Check if user exists
      let user = await User.findByEmail(email);

      if (!user) {
        // Create new user with specified role
        user = await User.create({
          name,
          email,
          googleId: payload.sub,
          avatar: picture,
          role,
          isEmailVerified: true,
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = payload.sub;
        user.avatar = picture;
        await user.save();
      } else {
        // User exists and has Google ID - check if they're trying to change role
        if (user.role !== role) {
          // If trying to upgrade to admin, check whitelist again
          if (role === 'admin') {
            const isWhitelisted =
              await AdminWhitelist.isEmailWhitelisted(email);
            if (!isWhitelisted) {
              throw new Error(
                'Access denied. Your email is not authorized for admin access. Please contact an existing admin to request access.'
              );
            }
          }
          // Update user role
          user.role = role;
          await user.save();
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user._id);

      return { user, accessToken, refreshToken };
    } catch (_error) {
      logger.error('Google OAuth error:', _error);
      throw new Error('Google authentication failed');
    }
  }

  async refreshAccessToken(_refreshToken) {
    try {
      const decoded = jwt.verify(_refreshToken, env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const { accessToken } = this.generateTokens(user._id);
      return { accessToken, user };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(_refreshToken) {
    // In a production app, you might want to blacklist the refresh token
    // For now, we'll just return success
    return { success: true };
  }

  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return user;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();
