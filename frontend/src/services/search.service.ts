import { apiClient } from '@/lib/api';

export interface SearchSuggestion {
  _id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    city: string;
  };
  category: {
    _id: string;
    name: string;
    color: string;
  };
  price: number;
  currency: string;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: SearchSuggestion[];
    tags: string[];
    total: number;
  };
}

export const searchService = {
  // Get search suggestions
  async getSearchSuggestions(searchTerm: string, limit: number = 10): Promise<SearchSuggestionsResponse> {
    return apiClient.get<SearchSuggestionsResponse>('/api/events/search/suggestions', {
      q: searchTerm,
      limit: limit.toString(),
    });
  },
};
