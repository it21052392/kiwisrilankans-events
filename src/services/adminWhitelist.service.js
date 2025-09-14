import { AdminWhitelist } from '../models/adminWhitelist.model.js';
import { logger } from '../config/logger.js';

class AdminWhitelistService {
  async addEmailToWhitelist(email, addedByUserId) {
    // Check if email is already whitelisted
    const existing = await AdminWhitelist.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (existing) {
      throw new Error('Email is already whitelisted');
    }

    // Add email to whitelist
    const whitelistEntry = await AdminWhitelist.addEmail(email, addedByUserId);

    logger.info(
      `Email ${email} added to admin whitelist by user ${addedByUserId}`
    );

    return whitelistEntry;
  }

  async removeEmailFromWhitelist(email) {
    const result = await AdminWhitelist.removeEmail(email);

    if (!result) {
      throw new Error('Email not found in whitelist');
    }

    logger.info(`Email ${email} removed from admin whitelist`);

    return result;
  }

  async getWhitelistedEmails() {
    const emails = await AdminWhitelist.find({ isActive: true })
      .populate('addedBy', 'name email')
      .sort({ addedAt: -1 });

    return emails;
  }

  async isEmailWhitelisted(email) {
    const result = await AdminWhitelist.isEmailWhitelisted(email);
    return !!result;
  }

  async getWhitelistStats() {
    const total = await AdminWhitelist.countDocuments({ isActive: true });
    const inactive = await AdminWhitelist.countDocuments({ isActive: false });

    return {
      total,
      inactive,
      active: total,
    };
  }
}

export const adminWhitelistService = new AdminWhitelistService();
