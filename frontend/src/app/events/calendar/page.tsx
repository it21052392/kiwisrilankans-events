'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useCalendarEvents } from '@/hooks/queries/useEvents';
import { useCategories } from '@/hooks/queries/useCategories';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users,
  Star,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useCalendarEvents(filters);
  const { data: categoriesData } = useCategories();

  const events = eventsData?.data?.events || [];
  const eventsByDate = eventsData?.data?.eventsByDate || {};
  const categories = categoriesData?.data?.categories || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return eventsByDate[dateString] || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatEventTime = (startDate: string) => {
    const date = new Date(startDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getEventUrl = (event: any) => {
    const slug = event.slug || generateSlug(event.title);
    return `/events/${slug}`;
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
            icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
            title="Error Loading Calendar"
            description="There was an error loading the calendar. Please try again later."
          />
        </div>
      </PublicLayout>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Event Calendar
          </h1>
          <p className="text-xl text-muted-foreground">
            View events in a calendar format
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
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
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-lg border p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground bg-muted/30 rounded-lg">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2" />;
              }

              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isPast = isPastDate(date);

              return (
                <div
                  key={date.toISOString()}
                  className={`p-2 min-h-[120px] border rounded-lg transition-all duration-200 ${
                    isCurrentDay 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : isPast 
                        ? 'bg-muted/30 border-muted' 
                        : 'hover:bg-muted/30 hover:shadow-sm'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isCurrentDay ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <Link
                        key={event._id}
                        href={getEventUrl(event)}
                        className="block group"
                      >
                        <div className={`text-xs p-2 rounded-md border transition-all duration-200 group-hover:shadow-sm group-hover:scale-[1.02] ${
                          event.category?.color 
                            ? `border-[${event.category.color}20] bg-[${event.category.color}10] group-hover:bg-[${event.category.color}20]`
                            : 'border-blue-200 bg-blue-50 group-hover:bg-blue-100'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatEventTime(event.startDate)}
                              </span>
                            </div>
                            <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                              {event.status}
                            </div>
                          </div>
                          <div className="font-medium text-foreground truncate mb-1">
                            {event.title}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {event.category && (
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: event.category.color || '#6b7280' }}
                                />
                              )}
                              <span className="text-xs text-muted-foreground truncate">
                                {event.category?.name || 'Event'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-primary">
                              {event.price === 0 ? 'Free' : `$${event.price}`}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1 px-2 bg-muted/50 rounded">
                        +{dayEvents.length - 3} more events
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        {events.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.slice(0, 6).map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{event.category?.name || 'Event'}</Badge>
                      <Badge variant="outline" className={`text-${event.status === 'published' ? 'green' : 'yellow'}-600`}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location?.name || 'Location TBD'}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.capacity} capacity
                        </div>
                        <div className="font-semibold text-primary">
                          {event.price === 0 ? 'Free' : `$${event.price}`}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href={getEventUrl(event)}>
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <EmptyState
            icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
            title="No Events Found"
            description="No events found for the selected month. Try changing the month or adjusting your filters."
          />
        )}
      </div>
    </PublicLayout>
  );
}
