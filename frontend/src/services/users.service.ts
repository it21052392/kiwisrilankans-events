import { apiClient } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'organizer' | 'admin';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  bio?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'organizer' | 'admin';
  isActive?: boolean;
  bio?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

export const usersService = {
  // Get all users (admin only)
  async getUsers(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<UsersResponse> {
    return apiClient.get<UsersResponse>('/api/users', filters);
  },

  // Get user by ID (admin only)
  async getUserById(id: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/api/users/${id}`);
  },

  // Update user (admin only)
  async updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/api/users/${id}`, data);
  },

  // Delete user (admin only)
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/users/${id}`);
  },

  // Update current user's profile
  async updateProfile(data: UpdateProfileData): Promise<UserResponse> {
    return apiClient.put<UserResponse>('/api/users/profile', data);
  },
};
