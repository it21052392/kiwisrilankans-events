import { useQuery } from '@tanstack/react-query';
import { communityStatsService } from '@/services/community-stats.service';

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ['community-stats'],
    queryFn: () => communityStatsService.getCommunityStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
