import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWhitelistService } from '@/services/admin-whitelist.service';

export const useAdminWhitelist = () => {
  return useQuery({
    queryKey: ['admin', 'whitelist'],
    queryFn: adminWhitelistService.getWhitelistedEmails,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddToWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminWhitelistService.addEmailToWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
    },
  });
};

export const useRemoveFromWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminWhitelistService.removeEmailFromWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
    },
  });
};

export const useCheckEmailWhitelist = (email: string) => {
  return useQuery({
    queryKey: ['admin', 'whitelist', 'check', email],
    queryFn: () => adminWhitelistService.checkEmailWhitelist(email),
    enabled: !!email,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWhitelistStats = () => {
  return useQuery({
    queryKey: ['admin', 'whitelist', 'stats'],
    queryFn: adminWhitelistService.getWhitelistStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
