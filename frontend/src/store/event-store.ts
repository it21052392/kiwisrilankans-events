import { create } from 'zustand';

export interface Event {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: {
    _id: string;
    name: string;
    color: string;
    icon?: string;
  };
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
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
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  tags: string[];
  requirements: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'draft' | 'pencil_hold' | 'pencil_hold_confirmed' | 'pending_approval' | 'published' | 'rejected' | 'unpublished' | 'cancelled' | 'completed' | 'deleted';
  featured: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  unpublishedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  unpublishedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  registrationCount: number;
  pencilHoldCount: number;
  pencilHoldInfo?: {
    pencilHoldId: string;
    expiresAt: string;
    notes: string;
    priority: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'startDate' | 'endDate' | 'title' | 'createdAt' | 'price' | 'capacity';
  sortOrder?: 'asc' | 'desc';
  hidePast?: boolean;
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  filters: EventFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<EventState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  filters: {
    search: '',
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    sortBy: 'startDate',
    sortOrder: 'asc',
    hidePast: true,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events]
  })),
  
  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map(event =>
      event._id === eventId ? { ...event, ...updates } : event
    ),
    currentEvent: state.currentEvent?._id === eventId 
      ? { ...state.currentEvent, ...updates }
      : state.currentEvent
  })),
  
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter(event => event._id !== eventId),
    currentEvent: state.currentEvent?._id === eventId ? null : state.currentEvent
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({
    filters: {
      search: '',
      category: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: 'startDate',
      sortOrder: 'asc',
      hidePast: true,
    }
  }),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
