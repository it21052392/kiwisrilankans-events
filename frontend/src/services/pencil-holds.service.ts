import { apiClient } from '@/lib/api';

export interface PencilHold {
  _id: string;
  eventId: string;
  event?: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: {
      name: string;
      address: string;
      city: string;
    };
  };
  userId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  notes: string;
  additionalInfo?: Record<string, any>;
  priority: number;
  status: 'pending' | 'confirmed' | 'converted' | 'cancelled' | 'expired';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PencilHoldsResponse {
  success: boolean;
  data: {
    pencilHolds: PencilHold[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PencilHoldResponse {
  success: boolean;
  data: {
    pencilHold: PencilHold;
  };
}

export interface CreatePencilHoldData {
  eventId: string;
  notes: string;
  additionalInfo?: Record<string, any>;
  priority?: number;
  expiresAt?: string;
}

export const pencilHoldsService = {
  // Get all pencil holds (admin only)
  async getPencilHolds(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    eventId?: string;
  } = {}): Promise<PencilHoldsResponse> {
    return apiClient.get<PencilHoldsResponse>('/api/pencil-holds', filters);
  },

  // Get pencil hold by ID
  async getPencilHoldById(id: string): Promise<PencilHoldResponse> {
    return apiClient.get<PencilHoldResponse>(`/api/pencil-holds/${id}`);
  },

  // Get my pencil holds
  async getMyPencilHolds(filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<PencilHoldsResponse> {
    return apiClient.get<PencilHoldsResponse>('/api/pencil-holds/my-holds', filters);
  },

  // Get organizer pencil holds (for events they created)
  async getOrganizerPencilHolds(filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<PencilHoldsResponse> {
    return apiClient.get<PencilHoldsResponse>('/api/pencil-holds/organizer-holds', filters);
  },

  // Get events with pencil holds (admin only)
  async getEventsWithPencilHolds(filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ success: boolean; data: { events: any[]; pagination: any } }> {
    return apiClient.get('/api/pencil-holds/events', filters);
  },

  // Create pencil hold
  async createPencilHold(data: CreatePencilHoldData): Promise<PencilHoldResponse> {
    return apiClient.post<PencilHoldResponse>('/api/pencil-holds', data);
  },

  // Update pencil hold
  async updatePencilHold(id: string, data: Partial<CreatePencilHoldData>): Promise<PencilHoldResponse> {
    return apiClient.put<PencilHoldResponse>(`/api/pencil-holds/${id}`, data);
  },

  // Delete pencil hold
  async deletePencilHold(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/pencil-holds/${id}`);
  },

  // Confirm pencil hold (organizer)
  async confirmPencilHold(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/pencil-holds/${id}/confirm`);
  },

  // Approve pencil hold (admin)
  async approvePencilHold(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/pencil-holds/${id}/approve`);
  },

  // Cancel pencil hold (admin)
  async cancelPencilHold(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/pencil-holds/${id}/cancel`);
  },
};