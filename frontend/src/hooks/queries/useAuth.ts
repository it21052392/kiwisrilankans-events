import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export const useCurrentUser = () => {
  const { accessToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getCurrentUser,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const { setAccessToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useTestAdminAccess = () => {
  return useQuery({
    queryKey: ['auth', 'test-admin'],
    queryFn: authService.testAdminAccess,
    enabled: false, // Only call when explicitly needed
  });
};