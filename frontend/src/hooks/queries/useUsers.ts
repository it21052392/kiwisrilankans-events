import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';

export const useUsers = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: () => usersService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      usersService.updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['users', 'detail', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: (_, userId) => {
      queryClient.removeQueries({ queryKey: ['users', 'detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
