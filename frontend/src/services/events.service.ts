import { apiClient } from '@/lib/api';
import { Event, EventFilters } from '@/store/event-store';
import { 
  mockEvents, 
  mockCategories, 
  createMockEventsResponse, 
  createMockEventResponse, 
  createMockCalendarResponse 
} from './mock-data.service';

export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface EventResponse {
  success: boolean;
  data: {
    event: Event;
  };
}

export interface CalendarEventsResponse {
  success: boolean;
  data: {
    events: Event[];
    eventsByDate: Record<string, Event[]>;
    total: number;
  };
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: number;
  price: number;
  currency: string;
  images?: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  tags?: string[];
  requirements?: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export const eventsService = {
  // Get all events with filters
  async getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>('/api/events', filters);
  },

  // Get events for calendar view
  async getCalendarEvents(filters: Partial<EventFilters> = {}): Promise<CalendarEventsResponse> {
    return apiClient.get<CalendarEventsResponse>('/api/events/calendar', filters);
  },

  // Get events for grid view
  async getGridEvents(filters: Partial<EventFilters> = {}): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>('/api/events/grid', filters);
  },

  // Get event by ID
  async getEventById(id: string): Promise<EventResponse> {
    return apiClient.get<EventResponse>(`/api/events/${id}`);
  },

  // Get event by slug
  async getEventBySlug(slug: string): Promise<EventResponse> {
    return apiClient.get<EventResponse>(`/api/events/slug/${slug}`);
  },

  // Create event
  async createEvent(data: CreateEventData): Promise<EventResponse> {
    return apiClient.post<EventResponse>('/api/events', data);
  },

  // Update event (admin)
  async updateEvent(id: string, data: Partial<CreateEventData>): Promise<EventResponse> {
    return apiClient.put<EventResponse>(`/api/events/${id}`, data);
  },

  // Update event by organizer
  async updateEventByOrganizer(id: string, data: Partial<CreateEventData>): Promise<EventResponse> {
    return apiClient.put<EventResponse>(`/api/events/${id}/organizer`, data);
  },

  // Delete event (admin)
  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/events/${id}`);
  },

  // Soft delete event (admin)
  async softDeleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/events/${id}/soft`);
  },

  // Restore event (admin)
  async restoreEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/events/${id}/restore`);
  },

  // Unpublish event (admin)
  async unpublishEvent(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/events/${id}/unpublish`);
  },

  // Delete event by organizer
  async deleteEventByOrganizer(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/events/${id}/organizer`);
  },

  // Admin: Approve event
  async approveEvent(id: string): Promise<{ success: boolean; message: string; data: { event: Event } }> {
    return apiClient.patch<{ success: boolean; message: string; data: { event: Event } }>(`/api/admin/events/${id}/approve`);
  },

  // Admin: Reject event
  async rejectEvent(id: string, reason: string): Promise<{ success: boolean; message: string; data: { event: Event } }> {
    return apiClient.patch<{ success: boolean; message: string; data: { event: Event } }>(`/api/admin/events/${id}/reject`, { reason });
  },

  // Admin: Get all events (with admin filters)
  async getAdminEvents(filters: EventFilters = {}): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>('/api/admin/events', filters);
  },

  // Admin: Get pending events
  async getPendingEvents(filters: Partial<EventFilters> = {}): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>('/api/admin/events/pending', filters);
  },

  // Check for event conflicts
  async checkEventConflicts(data: CreateEventData, excludeEventId?: string): Promise<{
    success: boolean;
    data: {
      hasConflict: boolean;
      conflicts: any[];
      conflictType: string | null;
      message: string;
      suggestions: any;
    };
  }> {
    const queryParams = excludeEventId ? { excludeEventId } : {};
    const endpoint = '/api/events/check-conflicts';
    const url = new URL(endpoint, window.location.origin);
    
    // Add query parameters to URL
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    return apiClient.post<{
      success: boolean;
      data: {
        hasConflict: boolean;
        conflicts: any[];
        conflictType: string | null;
        message: string;
        suggestions: any;
      };
    }>(url.pathname + url.search, data);
  },
};
