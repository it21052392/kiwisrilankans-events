import express from 'express';
import {
  getEventSharingData,
  generateShareableLink,
  getSocialMediaLinks,
  trackShare,
  getEventBySlug,
} from '../controllers/sharing.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Public sharing routes
router.get(
  '/events/:id/share',
  validateParams(commonSchemas.mongoId),
  getEventSharingData
);

router.post(
  '/events/:id/share/link',
  validateParams(commonSchemas.mongoId),
  generateShareableLink
);

router.get(
  '/events/:id/share/social',
  validateParams(commonSchemas.mongoId),
  getSocialMediaLinks
);

router.post(
  '/events/:id/share/track',
  validateParams(commonSchemas.mongoId),
  validateBody({
    body: {
      platform: {
        type: 'string',
        required: true,
        enum: [
          'facebook',
          'twitter',
          'linkedin',
          'whatsapp',
          'telegram',
          'email',
          'copy',
        ],
      },
    },
  }),
  trackShare
);

router.get('/events/slug/:slug', getEventBySlug);

export default router;
