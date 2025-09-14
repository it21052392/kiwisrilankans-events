import express from 'express';
import {
  register,
  login,
  googleAuth,
  googleCallback,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { authSchemas } from '../validators/auth.schema.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(authSchemas.register), register);
router.post('/login', validateBody(authSchemas.login), login);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
