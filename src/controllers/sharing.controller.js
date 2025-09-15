import { asyncHandler } from '../utils/asyncHandler.js';
import { sharingService } from '../services/sharing.service.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

// @desc    Get event sharing data
// @route   GET /api/events/:id/share
// @access  Public
const getEventSharingData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const baseUrl = env.FRONTEND_URL || 'http://localhost:3000';

  const eventData = await sharingService.getEventForSharing(id);
  const socialLinks = await sharingService.generateSocialMediaLinks(
    id,
    baseUrl
  );

  res.json({
    success: true,
    data: {
      event: eventData,
      sharing: {
        url: socialLinks,
        copyText: `Check out this event: ${eventData.title} - ${socialLinks.facebook.split('u=')[1]}`,
      },
    },
  });
});

// @desc    Generate shareable link
// @route   POST /api/events/:id/share/link
// @access  Public
const generateShareableLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const baseUrl = env.FRONTEND_URL || 'http://localhost:3000';

  const shareData = await sharingService.generateShareableLink(id, baseUrl);

  res.json({
    success: true,
    data: shareData,
  });
});

// @desc    Get social media sharing links
// @route   GET /api/events/:id/share/social
// @access  Public
const getSocialMediaLinks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const baseUrl = env.FRONTEND_URL || 'http://localhost:3000';

  const socialLinks = await sharingService.generateSocialMediaLinks(
    id,
    baseUrl
  );

  res.json({
    success: true,
    data: socialLinks,
  });
});

// @desc    Track share event
// @route   POST /api/events/:id/share/track
// @access  Public
const trackShare = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { platform } = req.body;

  if (!platform) {
    return res.status(400).json({
      success: false,
      message: 'Platform is required',
    });
  }

  await sharingService.trackShare(id, platform);

  logger.info(`Event ${id} shared on ${platform}`);

  res.json({
    success: true,
    message: 'Share tracked successfully',
  });
});

// @desc    Get event by slug (for public sharing)
// @route   GET /api/events/slug/:slug
// @access  Public
const getEventBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const event = await sharingService.getEventForSharing(slug);

  res.json({
    success: true,
    data: { event },
  });
});

export {
  getEventSharingData,
  generateShareableLink,
  getSocialMediaLinks,
  trackShare,
  getEventBySlug,
};
