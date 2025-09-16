import { apiClient } from '@/lib/api';

export interface ShareEventData {
  eventId: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email';
  message?: string;
  recipientEmail?: string; // For email sharing
}

export interface ShareEventResponse {
  success: boolean;
  data: {
    shareUrl: string;
    platform: string;
    message: string;
  };
}

export interface GetShareUrlResponse {
  success: boolean;
  data: {
    shareUrl: string;
    platforms: {
      facebook: string;
      twitter: string;
      linkedin: string;
      whatsapp: string;
      telegram: string;
      email: string;
    };
  };
}

export const sharingService = {
  // Get share URLs for all platforms
  async getShareUrls(eventId: string): Promise<GetShareUrlResponse> {
    return apiClient.get<GetShareUrlResponse>(`/api/sharing/event/${eventId}/urls`);
  },

  // Share event to specific platform
  async shareEvent(data: ShareEventData): Promise<ShareEventResponse> {
    return apiClient.post<ShareEventResponse>('/api/sharing/share', data);
  },

  // Get event share count
  async getEventShareCount(eventId: string): Promise<{
    success: boolean;
    data: {
      totalShares: number;
      platformShares: {
        facebook: number;
        twitter: number;
        linkedin: number;
        whatsapp: number;
        telegram: number;
        email: number;
      };
    };
  }> {
    return apiClient.get(`/api/sharing/event/${eventId}/count`);
  },
};