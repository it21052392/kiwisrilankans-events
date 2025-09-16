import { useQuery, useMutation } from '@tanstack/react-query';
import { sharingService } from '@/services/sharing.service';

export const useShareUrls = (eventId: string) => {
  return useQuery({
    queryKey: ['sharing', 'urls', eventId],
    queryFn: () => sharingService.getShareUrls(eventId),
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useShareEvent = () => {
  return useMutation({
    mutationFn: sharingService.shareEvent,
  });
};

export const useEventShareCount = (eventId: string) => {
  return useQuery({
    queryKey: ['sharing', 'count', eventId],
    queryFn: () => sharingService.getEventShareCount(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
