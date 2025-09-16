import { apiClient } from '@/lib/api';

export interface AdminWhitelistEntry {
  id: string;
  email: string;
  addedBy?: {
    id: string;
    name: string;
    email: string;
  };
  addedAt: string;
  isActive: boolean;
}

export interface AdminWhitelistResponse {
  success: boolean;
  data: {
    emails: AdminWhitelistEntry[];
  };
}

export interface AddToWhitelistData {
  email: string;
}

export interface AddToWhitelistResponse {
  success: boolean;
  message: string;
  data: {
    whitelistEntry: AdminWhitelistEntry;
  };
}

export interface RemoveFromWhitelistResponse {
  success: boolean;
  message: string;
  data: {
    removedEmail: string;
    removedAt: string;
  };
}

export const adminWhitelistService = {
  // Get all whitelisted emails
  async getWhitelistedEmails(): Promise<AdminWhitelistResponse> {
    return apiClient.get<AdminWhitelistResponse>('/api/admin/whitelist');
  },

  // Add email to whitelist
  async addEmailToWhitelist(data: AddToWhitelistData): Promise<AddToWhitelistResponse> {
    return apiClient.post<AddToWhitelistResponse>('/api/admin/whitelist', data);
  },

  // Remove email from whitelist
  async removeEmailFromWhitelist(email: string): Promise<RemoveFromWhitelistResponse> {
    return apiClient.delete<RemoveFromWhitelistResponse>(`/api/admin/whitelist/${email}`);
  },

  // Check if email is whitelisted
  async checkEmailWhitelist(email: string): Promise<{
    success: boolean;
    data: {
      email: string;
      isWhitelisted: boolean;
    };
  }> {
    return apiClient.get(`/api/admin/whitelist/check/${email}`);
  },

  // Get whitelist statistics
  async getWhitelistStats(): Promise<{
    success: boolean;
    data: {
      stats: {
        total: number;
        active: number;
        inactive: number;
      };
    };
  }> {
    return apiClient.get('/api/admin/whitelist/stats');
  },
};
