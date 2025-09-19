'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventList } from '@/components/events/EventList';
import { useEvents } from '@/hooks/queries/useEvents';
import { useCategories } from '@/hooks/queries/useCategories';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Grid3X3, 
  List, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'startDate' as 'title' | 'startDate' | 'endDate' | 'createdAt' | 'price' | 'capacity',
    sortOrder: 'asc' as 'asc' | 'desc',
    hidePast: true,
  });

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents(filters);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const events = eventsData?.data?.events || [];
  const categories = categoriesData?.data?.categories || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      sortBy: 'startDate',
      sortOrder: 'asc',
      hidePast: true,
    });
  };

  const handleSaveEvent = (eventId: string) => {
    toast.success('Event saved to your favorites!');
  };

  const handleShareEvent = (eventId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this event!',
        url: `${window.location.origin}/events/${eventId}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (eventsLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (eventsError) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="Error Loading Events"
            description="There was an error loading the events. Please try again later."
          />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            All Events
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover and join events in the Sri Lankan community
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-64">
              <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="w-full lg:w-32">
              <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Toggle and Clear Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Events Display */}
        <EventList
          events={events}
          isLoading={eventsLoading}
          error={eventsError}
          variant={view === 'list' ? 'compact' : 'default'}
          showActions={true}
          onSave={handleSaveEvent}
          onShare={handleShareEvent}
          emptyMessage="No Events Found"
          emptyDescription="No events match your current filters. Try adjusting your search criteria."
        />

        {/* Pagination */}
        {eventsData?.data?.pagination && eventsData.data.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {eventsData.data.pagination.page} of {eventsData.data.pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
