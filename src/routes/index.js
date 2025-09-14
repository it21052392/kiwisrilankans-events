import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import categoryRoutes from './categories.routes.js';
import eventRoutes from './events.routes.js';
import adminRoutes from './admin.routes.js';
import pencilHoldRoutes from './pencilHolds.routes.js';
import subscriptionRoutes from './subscriptions.routes.js';
import uploadRoutes from './uploads.routes.js';
import utilRoutes from './util.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'Kiwi Sri Lankans Events API',
      description:
        'Event management platform for the Kiwi Sri Lankan community',
    },
  });
});

// Route definitions
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/events', eventRoutes);
router.use('/admin', adminRoutes);
router.use('/pencil-holds', pencilHoldRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/uploads', uploadRoutes);
router.use('/utils', utilRoutes);

export default router;
