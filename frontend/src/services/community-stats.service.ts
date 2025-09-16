import { apiClient } from '@/lib/api';

export interface CommunityStats {
  events: {
    total: number;
    published: number;
  };
  users: {
    total: number;
    organizers: number;
  };
  categories: {
    total: number;
    active: number;
  };
  timestamp: string;
}

export interface CommunityStatsResponse {
  success: boolean;
  data: CommunityStats;
}

export const communityStatsService = {
  // Get community statistics
  async getCommunityStats(): Promise<CommunityStatsResponse> {
    return apiClient.get<CommunityStatsResponse>('/api/utils/community-stats');
  },
};
