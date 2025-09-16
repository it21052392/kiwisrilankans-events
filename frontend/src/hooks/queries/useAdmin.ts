import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWhitelist = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['admin', 'whitelist', filters],
    queryFn: () => adminService.getWhitelist(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddToWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.addToWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
    },
  });
};

export const useRemoveFromWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.removeFromWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
    },
  });
};

export const useToggleWhitelistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.toggleWhitelistStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
    },
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminService.getSystemHealth,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};