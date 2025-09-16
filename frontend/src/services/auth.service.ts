import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export const authService = {
  // Initiate Google OAuth for organizer
  initiateOrganizerAuth(): void {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/organizer`;
  },

  // Initiate Google OAuth for admin
  initiateAdminAuth(): void {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/admin`;
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/api/auth/me');
  },

  // Refresh access token
  async refreshToken(): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>('/api/auth/refresh');
  },

  // Logout user
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/logout');
  },

  // Test admin access
  async testAdminAccess(): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.get<{ success: boolean; message: string; user: User }>('/api/auth/test-admin');
  },
};