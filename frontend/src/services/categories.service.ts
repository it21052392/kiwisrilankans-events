import { apiClient } from '@/lib/api';
import { mockCategories, createMockCategoriesResponse } from './mock-data.service';

export interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CategoryResponse {
  success: boolean;
  data: {
    category: Category;
  };
}

export interface CreateCategoryData {
  name: string;
  description: string;
  color: string;
  icon?: string;
  sortOrder?: number;
}

export const categoriesService = {
  // Get all categories
  async getCategories(filters: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  } = {}): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>('/api/categories', filters);
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<CategoryResponse> {
    return apiClient.get<CategoryResponse>(`/api/categories/${id}`);
  },

  // Create category (admin)
  async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
    return apiClient.post<CategoryResponse>('/api/categories', data);
  },

  // Update category (admin)
  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<CategoryResponse> {
    return apiClient.put<CategoryResponse>(`/api/categories/${id}`, data);
  },

  // Delete category (admin)
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/categories/${id}`);
  },

  // Toggle category status (admin)
  async toggleCategoryStatus(id: string): Promise<CategoryResponse> {
    return apiClient.patch<CategoryResponse>(`/api/categories/${id}/toggle`);
  },
};
