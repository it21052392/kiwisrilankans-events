import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/events.service';
import { EventFilters } from '@/store/event-store';

export const useEvents = (filters: EventFilters = {}, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ['events', 'list', filters],
    queryFn: () => eventsService.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false, // Default to true, but allow disabling
  });
};

export const useCalendarEvents = (filters: Partial<EventFilters> = {}) => {
  return useQuery({
    queryKey: ['events', 'calendar', filters],
    queryFn: () => eventsService.getCalendarEvents(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGridEvents = (filters: Partial<EventFilters> = {}) => {
  return useQuery({
    queryKey: ['events', 'grid', filters],
    queryFn: () => eventsService.getGridEvents(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => eventsService.getEventById(id),
    enabled: !!id,
  });
};

export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['events', 'slug', slug],
    queryFn: () => eventsService.getEventBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.createEvent,
    onSuccess: (data) => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
      
      // Add the new event to the cache
      queryClient.setQueryData(['events', 'detail', data.data.event._id], data);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsService.updateEvent(id, data),
    onSuccess: (data, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(['events', 'detail', variables.id], data);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useUpdateEventByOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsService.updateEventByOrganizer(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['events', 'detail', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.deleteEvent,
    onSuccess: (_, eventId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['events', 'detail', eventId] });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useSoftDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.softDeleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.restoreEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useUnpublishEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.unpublishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

// Admin hooks
export const useAdminEvents = (filters: EventFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'events', filters],
    queryFn: () => eventsService.getAdminEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePendingEvents = (filters: Partial<EventFilters> = {}) => {
  return useQuery({
    queryKey: ['admin', 'events', 'pending', filters],
    queryFn: () => eventsService.getPendingEvents(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useApproveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.approveEvent,
    onSuccess: (data, eventId) => {
      // Update the specific event in cache
      queryClient.setQueryData(['events', 'detail', eventId], data);
      
      // Invalidate admin events lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};

export const useRejectEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => eventsService.rejectEvent(id, reason),
    onSuccess: (data, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(['events', 'detail', variables.id], data);
      
      // Invalidate admin events lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'grid'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] });
    },
  });
};