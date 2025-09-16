'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchSuggestions } from '@/hooks/queries/useSearchSuggestions';
import { Search, X, Clock, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search events...", className = "" }: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the input value and call onChange
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(inputValue);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue]); // Removed onChange from dependencies to prevent unnecessary re-triggers

  // Only fetch suggestions when we have a value and the dropdown should be open
  const shouldFetch = inputValue.length >= 2 && isOpen;
  const { data: suggestionsData, isLoading } = useSearchSuggestions(inputValue, shouldFetch);

  const suggestions = suggestionsData?.data?.suggestions || [];
  const tags = suggestionsData?.data?.tags || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      setIsOpen(true);
      setShowSuggestions(true);
    } else {
      setIsOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      setIsOpen(true);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.title);
    onChange(suggestion.title);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const handleTagClick = (tag: string) => {
    setInputValue(tag);
    onChange(tag);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const formatEventTime = (startDate: string) => {
    const date = new Date(startDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (startDate: string) => {
    const date = new Date(startDate);
    return format(date, 'MMM dd');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {isLoading ? (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>


      {/* Dropdown Suggestions */}
      {isOpen && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : suggestions.length > 0 || tags.length > 0 ? (
            <div className="p-2">
              {/* Event Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Events ({suggestions.length})
                  </div>
                  {suggestions.map((suggestion) => (
                    <Link
                      key={suggestion._id}
                      href={`/events/${suggestion.slug || suggestion._id}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Card className="mb-2 hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatEventDate(suggestion.startDate)} at {formatEventTime(suggestion.startDate)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {suggestion.location?.name || 'Location TBD'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ backgroundColor: `${suggestion.category?.color}20`, color: suggestion.category?.color }}
                                >
                                  {suggestion.category?.name || 'Event'}
                                </Badge>
                                <span className="text-xs font-semibold text-primary">
                                  {suggestion.price === 0 ? 'Free' : `$${suggestion.price}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tag Suggestions */}
              {tags.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tags ({tags.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleTagClick(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events found for "{inputValue}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
