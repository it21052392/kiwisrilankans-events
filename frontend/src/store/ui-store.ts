import { create } from 'zustand';

export type ViewType = 'list' | 'grid' | 'calendar';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Event view settings
  eventView: ViewType;
  hidePastEvents: boolean;
  
  // Sidebar
  sidebarOpen: boolean;
  
  // Modals
  modals: {
    eventCreate: boolean;
    eventEdit: boolean;
    eventDelete: boolean;
    pencilHoldCreate: boolean;
    pencilHoldEdit: boolean;
    userProfile: boolean;
    settings: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setEventView: (view: ViewType) => void;
  setHidePastEvents: (hide: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'system',
  eventView: 'list',
  hidePastEvents: true,
  sidebarOpen: false,
  modals: {
    eventCreate: false,
    eventEdit: false,
    eventDelete: false,
    pencilHoldCreate: false,
    pencilHoldEdit: false,
    userProfile: false,
    settings: false,
  },
  notifications: [],

  setTheme: (theme) => set({ theme }),
  setEventView: (eventView) => set({ eventView }),
  setHidePastEvents: (hidePastEvents) => set({ hidePastEvents }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  
  closeAllModals: () => set({
    modals: {
      eventCreate: false,
      eventEdit: false,
      eventDelete: false,
      pencilHoldCreate: false,
      pencilHoldEdit: false,
      userProfile: false,
      settings: false,
    }
  }),

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] }),
}));
