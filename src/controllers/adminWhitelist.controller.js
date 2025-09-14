import { asyncHandler } from '../utils/asyncHandler.js';
import { adminWhitelistService } from '../services/adminWhitelist.service.js';
import { logger } from '../config/logger.js';

// @desc    Add email to admin whitelist
// @route   POST /api/admin/whitelist
// @access  Private (Admin only)
const addEmailToWhitelist = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const addedBy = req.user._id;

  const whitelistEntry = await adminWhitelistService.addEmailToWhitelist(
    email,
    addedBy
  );

  logger.info(`Admin ${req.user.email} added ${email} to whitelist`);

  res.status(201).json({
    success: true,
    message: 'Email added to admin whitelist successfully',
    data: {
      whitelistEntry: {
        id: whitelistEntry._id,
        email: whitelistEntry.email,
        addedAt: whitelistEntry.addedAt,
        isActive: whitelistEntry.isActive,
      },
    },
  });
});

// @desc    Remove email from admin whitelist
// @route   DELETE /api/admin/whitelist/:email
// @access  Private (Admin only)
const removeEmailFromWhitelist = asyncHandler(async (req, res) => {
  const { email } = req.params;

  await adminWhitelistService.removeEmailFromWhitelist(email);

  logger.info(`Admin ${req.user.email} removed ${email} from whitelist`);

  res.json({
    success: true,
    message: 'Email removed from admin whitelist successfully',
    data: {
      removedEmail: email,
      removedAt: new Date(),
    },
  });
});

// @desc    Get all whitelisted emails
// @route   GET /api/admin/whitelist
// @access  Private (Admin only)
const getWhitelistedEmails = asyncHandler(async (req, res) => {
  const emails = await adminWhitelistService.getWhitelistedEmails();

  res.json({
    success: true,
    data: {
      emails: emails.map(entry => ({
        id: entry._id,
        email: entry.email,
        addedBy: entry.addedBy
          ? {
              id: entry.addedBy._id,
              name: entry.addedBy.name,
              email: entry.addedBy.email,
            }
          : null,
        addedAt: entry.addedAt,
        isActive: entry.isActive,
      })),
    },
  });
});

// @desc    Check if email is whitelisted
// @route   GET /api/admin/whitelist/check/:email
// @access  Private (Admin only)
const checkEmailWhitelist = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const isWhitelisted = await adminWhitelistService.isEmailWhitelisted(email);

  res.json({
    success: true,
    data: {
      email,
      isWhitelisted,
    },
  });
});

// @desc    Get whitelist statistics
// @route   GET /api/admin/whitelist/stats
// @access  Private (Admin only)
const getWhitelistStats = asyncHandler(async (req, res) => {
  const stats = await adminWhitelistService.getWhitelistStats();

  res.json({
    success: true,
    data: {
      stats,
    },
  });
});

export {
  addEmailToWhitelist,
  removeEmailFromWhitelist,
  getWhitelistedEmails,
  checkEmailWhitelist,
  getWhitelistStats,
};
