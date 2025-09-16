import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pencilHoldsService } from '@/services/pencil-holds.service';

export const usePencilHolds = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  eventId?: string;
} = {}) => {
  return useQuery({
    queryKey: ['pencil-holds', 'list', filters],
    queryFn: () => pencilHoldsService.getPencilHolds(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMyPencilHolds = (filters: {
  page?: number;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ['pencil-holds', 'my-holds', filters],
    queryFn: () => pencilHoldsService.getMyPencilHolds(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePencilHold = (id: string) => {
  return useQuery({
    queryKey: ['pencil-holds', 'detail', id],
    queryFn: () => pencilHoldsService.getPencilHoldById(id),
    enabled: !!id,
  });
};

export const useCreatePencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pencilHoldsService.createPencilHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pencil-holds'] });
    },
  });
};

export const useUpdatePencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      pencilHoldsService.updatePencilHold(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['pencil-holds', 'detail', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['pencil-holds', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['pencil-holds', 'my-holds'] });
    },
  });
};

export const useDeletePencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pencilHoldsService.deletePencilHold,
    onSuccess: (_, pencilHoldId) => {
      queryClient.removeQueries({ queryKey: ['pencil-holds', 'detail', pencilHoldId] });
      queryClient.invalidateQueries({ queryKey: ['pencil-holds'] });
    },
  });
};

export const useConfirmPencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pencilHoldsService.confirmPencilHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pencil-holds'] });
    },
  });
};

export const useApprovePencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pencilHoldsService.approvePencilHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pencil-holds'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useCancelPencilHold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pencilHoldsService.cancelPencilHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pencil-holds'] });
    },
  });
};