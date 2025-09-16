import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';

export const useSearchSuggestions = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search-suggestions', searchTerm],
    queryFn: () => searchService.getSearchSuggestions(searchTerm, 10),
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on error for search suggestions
  });
};
