import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';

const defaultFilters = {};

export const useCategories = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
} = defaultFilters) => {
  return useQuery({
    queryKey: ['categories', filters],
    queryFn: () => categoriesService.getCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', 'detail', id],
    queryFn: () => categoriesService.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesService.updateCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['categories', 'detail', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.toggleCategoryStatus,
    onSuccess: (data, categoryId) => {
      queryClient.setQueryData(['categories', 'detail', categoryId], data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
