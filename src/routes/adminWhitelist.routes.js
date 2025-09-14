import express from 'express';
import {
  addEmailToWhitelist,
  removeEmailFromWhitelist,
  getWhitelistedEmails,
  checkEmailWhitelist,
  getWhitelistStats,
} from '../controllers/adminWhitelist.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import { validateBody } from '../middlewares/validate.js';
import { adminWhitelistSchemas } from '../validators/adminWhitelist.schema.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// Admin whitelist management routes
router.post(
  '/whitelist',
  validateBody(adminWhitelistSchemas.addEmail),
  addEmailToWhitelist
);
router.get('/whitelist', getWhitelistedEmails);
router.get('/whitelist/stats', getWhitelistStats);
router.get('/whitelist/check/:email', checkEmailWhitelist);
router.delete('/whitelist/:email', removeEmailFromWhitelist);

export default router;
