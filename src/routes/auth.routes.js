import express from 'express';
import {
  googleAuthOrganizer,
  googleAuthAdmin,
  googleCallback,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes - Google OAuth only
router.get('/google/organizer', googleAuthOrganizer);
router.get('/google/admin', googleAuthAdmin);
router.get('/google/callback', googleCallback);
router.post('/refresh', refreshToken);

// Test endpoint to verify admin access
router.get('/test-admin', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access verified',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
