import { apiClient } from '@/lib/api';

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalCategories: number;
  totalPencilHolds: number;
  eventsByStatus: {
    draft: number;
    pending_approval: number;
    published: number;
    rejected: number;
    unpublished: number;
    cancelled: number;
    completed: number;
    deleted: number;
  };
  recentEvents: any[];
  recentUsers: any[];
  recentPencilHolds: any[];
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

export interface WhitelistEntry {
  _id: string;
  email: string;
  role: 'organizer' | 'admin';
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

export interface WhitelistResponse {
  success: boolean;
  data: {
    whitelist: WhitelistEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AddToWhitelistData {
  email: string;
  role: 'organizer' | 'admin';
}

export const adminService = {
  // Get admin dashboard stats
  async getDashboardStats(): Promise<AdminStatsResponse> {
    return apiClient.get<AdminStatsResponse>('/api/admin/dashboard/stats');
  },

  // Get whitelist entries
  async getWhitelist(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<WhitelistResponse> {
    return apiClient.get<WhitelistResponse>('/api/admin/whitelist', filters);
  },

  // Add email to whitelist
  async addToWhitelist(data: AddToWhitelistData): Promise<{
    success: boolean;
    data: { whitelistEntry: WhitelistEntry };
  }> {
    return apiClient.post('/api/admin/whitelist', data);
  },

  // Remove email from whitelist
  async removeFromWhitelist(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/api/admin/whitelist/${id}`);
  },

  // Toggle whitelist entry status
  async toggleWhitelistStatus(id: string): Promise<{
    success: boolean;
    data: { whitelistEntry: WhitelistEntry };
  }> {
    return apiClient.patch(`/api/admin/whitelist/${id}/toggle`);
  },

  // Get system health
  async getSystemHealth(): Promise<{
    success: boolean;
    data: {
      status: string;
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      database: {
        status: string;
        responseTime: number;
      };
    };
  }> {
    return apiClient.get('/api/admin/health');
  },
};