import { Event } from '../models/event.model.js';
import { logger } from '../config/logger.js';

class SharingService {
  async generateShareableLink(eventId, baseUrl) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.isDeleted || event.status !== 'published') {
      throw new Error('Event is not available for sharing');
    }

    const shareableUrl = `${baseUrl}/events/${event.slug || event._id}`;

    return {
      url: shareableUrl,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      category: event.category,
      image: event.images?.[0]?.url || null,
    };
  }

  async generateSocialMediaLinks(eventId, baseUrl) {
    const eventData = await this.generateShareableLink(eventId, baseUrl);

    const encodedUrl = encodeURIComponent(eventData.url);
    const encodedTitle = encodeURIComponent(eventData.title);
    const encodedDescription = encodeURIComponent(eventData.description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    };
  }

  async getEventForSharing(eventId) {
    const event = await Event.findById(eventId)
      .populate('category', 'name color icon')
      .select('-isDeleted -deletedAt -deletedBy');

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.isDeleted || event.status !== 'published') {
      throw new Error('Event is not available for sharing');
    }

    return {
      id: event._id,
      title: event.title,
      description: event.description,
      slug: event.slug,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      category: event.category,
      images: event.images,
      price: event.price,
      currency: event.currency,
      capacity: event.capacity,
      registrationCount: event.registrationCount,
      tags: event.tags,
      requirements: event.requirements,
      contactInfo: event.contactInfo,
      featured: event.featured,
      createdAt: event.createdAt,
    };
  }

  async trackShare(eventId, platform) {
    // In a real application, you might want to track sharing analytics
    logger.info(`Event ${eventId} shared on ${platform}`);

    // You could increment a share count field here
    // await Event.findByIdAndUpdate(eventId, { $inc: { shareCount: 1 } });

    return { success: true };
  }
}

export const sharingService = new SharingService();
