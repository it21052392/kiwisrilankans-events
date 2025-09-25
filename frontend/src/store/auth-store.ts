import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'admin';
  avatar?: string;
  createdAt: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      login: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }),
      
      logout: async () => {
        try {
          // Try to logout on the server, but don't fail if it doesn't work
          await authService.logout();
        } catch (error) {
          // Log the error but don't throw it - we still want to clear local state
        } finally {
          // Always clear local state regardless of API call success
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
      
      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const response = await authService.getCurrentUser();
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          
          // If it's a 401 error, try to refresh the token
          if (error.status === 401) {
            try {
              await get().refreshToken();
              return; // refreshToken will update the state
            } catch (refreshError) {
            }
          }
          
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Authentication failed',
          });
        }
      },

      refreshToken: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.refreshToken();
          set({
            accessToken: response.data.accessToken,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Token refresh failed',
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
