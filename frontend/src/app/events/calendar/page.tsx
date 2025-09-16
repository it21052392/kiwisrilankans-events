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
  Users 
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
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
                  className={`p-2 min-h-[100px] border rounded-lg ${
                    isCurrentDay 
                      ? 'bg-primary/10 border-primary' 
                      : isPast 
                        ? 'bg-muted/50' 
                        : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Link
                        key={event._id}
                        href={`/events/${event.slug || event._id}`}
                        className="block"
                      >
                        <div className="text-xs p-1 bg-primary/20 text-primary rounded truncate hover:bg-primary/30 transition-colors">
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
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
                      <Link href={`/events/${event.slug || event._id}`}>
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
