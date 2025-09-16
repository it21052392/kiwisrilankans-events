import express from 'express';
import {
  getSystemInfo,
  getHealthCheck,
  getStats,
  getCommunityStats,
} from '../controllers/util.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';

const router = express.Router();

// Public utility routes
router.get('/health', getHealthCheck);
router.get('/stats', getStats);
router.get('/community-stats', getCommunityStats);

// Protected utility routes
router.use(authenticate);

// Admin only utility routes
router.use(requireAdmin);

router.get('/system', getSystemInfo);

export default router;
