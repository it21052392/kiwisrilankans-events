'use client';

import { useState, useEffect, useCallback } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
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
  MoreHorizontal,
  Search,
  Filter,
  X,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatEventTime as formatEventTimeUtil, formatEventDateShort } from '@/lib/time-utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState({
    category: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError, isFetching } = useCalendarEvents(debouncedFilters);
  const { data: categoriesData } = useCategories();

  const events = eventsData?.data?.events || [];
  const eventsByDate = eventsData?.data?.eventsByDate || {};
  const categories = categoriesData?.data?.categories || [];

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Week navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
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

  // Get week dates
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  // Get time slots (1 AM to 11 PM)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 1; hour <= 23; hour++) {
      slots.push({
        hour,
        label: hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
        time: `${hour.toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  // Get events for a specific day and time slot
  const getEventsForDayAndTime = (date: Date, hour: number) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dateString] || [];
    
    return dayEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();
      
      // Check if event overlaps with this time slot (hour to hour+1)
      // Event starts before or during this hour AND ends after this hour starts
      return eventStartHour <= hour && eventEndHour > hour;
    });
  };

  // Get all events for a day with overlap detection
  const getEventsForDayWithOverlap = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dateString] || [];
    
    // Sort events by start time
    const sortedEvents = dayEvents.sort((a, b) => {
      const aStart = new Date(a.startDate);
      const bStart = new Date(b.startDate);
      return aStart.getTime() - bStart.getTime();
    });

    // Group overlapping events
    const eventGroups: any[][] = [];
    let currentGroup: any[] = [];
    let lastEndTime = 0;

    sortedEvents.forEach(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const startTime = eventStart.getTime();
      const endTime = eventEnd.getTime();

      if (startTime < lastEndTime) {
        // Event overlaps with current group
        currentGroup.push(event);
      } else {
        // Start new group
        if (currentGroup.length > 0) {
          eventGroups.push([...currentGroup]);
        }
        currentGroup = [event];
      }
      lastEndTime = Math.max(lastEndTime, endTime);
    });

    if (currentGroup.length > 0) {
      eventGroups.push(currentGroup);
    }

    return eventGroups;
  };

  // Calculate event position and height with overlap handling
  const getEventPosition = (event: any, hour: number, groupIndex: number = 0, groupSize: number = 1) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const eventStartHour = eventStart.getHours();
    const eventStartMinute = eventStart.getMinutes();
    const eventEndHour = eventEnd.getHours();
    const eventEndMinute = eventEnd.getMinutes();
    
    const startTimeInHours = eventStartHour + (eventStartMinute / 60);
    const endTimeInHours = eventEndHour + (eventEndMinute / 60);
    const durationInHours = endTimeInHours - startTimeInHours;
    
    const top = ((startTimeInHours - hour) * 60) + 'px';
    const height = (durationInHours * 60) + 'px';
    
    // Calculate width and left position for overlapping events
    const width = groupSize > 1 ? `${100 / groupSize}%` : '100%';
    const left = groupSize > 1 ? `${(groupIndex * 100) / groupSize}%` : '0%';
    
    return { top, height, width, left };
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

  const formatEventTime = (event: any) => {
    return formatEventTimeUtil(event);
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pencil_hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pencil_hold_confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventStatusDisplay = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'pencil_hold':
        return 'Pencil Hold';
      case 'pencil_hold_confirmed':
        return 'Confirmed';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
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

  // Year and month navigation
  const navigateToMonth = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1));
  };

  const navigateToYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate year options (current year ± 5 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  // Generate month options
  const getMonthOptions = () => {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' },
    ];
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      search: '',
    });
    setDebouncedFilters({
      category: '',
      search: '',
    });
  }, []);

  // Handle search input change with debouncing - removed since we now use a search button

  // Handle category filter change immediately (no debouncing needed)
  useEffect(() => {
    setDebouncedFilters(prev => ({ ...prev, category: filters.category }));
  }, [filters.category]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't handle keyboard shortcuts when typing in inputs
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (viewMode === 'week') {
            navigateWeek('prev');
          } else {
            navigateMonth('prev');
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (viewMode === 'week') {
            navigateWeek('next');
          } else {
            navigateMonth('next');
          }
          break;
        case 'Home':
          event.preventDefault();
          goToToday();
          break;
        case 'Escape':
          event.preventDefault();
          setShowFilters(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, viewMode]);

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

  const weekDates = getWeekDates(currentDate);
  const timeSlots = getTimeSlots();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Event Calendar
            </h1>
            {isFetching && eventsData && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            )}
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            View events in a Google Calendar-style format
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd>
              Navigate {viewMode === 'week' ? 'weeks' : 'months'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Home</kbd>
              Go to today
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
              Close filters
            </span>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Input with Suggestions */}
              <div className="flex-1 sm:max-w-md">
                <SearchInput
                  value={filters.search}
                  onChange={(value) => handleFilterChange('search', value)}
                  placeholder="Search events..."
                />
              </div>

              {/* Filter Toggle Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.category || filters.search) && (
                  <Badge variant="secondary" className="ml-1">
                    {[filters.category && 'Category', filters.search && 'Search'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* View Mode Toggle and Navigation */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="h-8"
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="h-8"
                >
                  Month
                </Button>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full sm:w-64">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select 
                      value={filters.category || "all"} 
                      onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}
                    >
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
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-lg border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <h2 className="text-lg sm:text-2xl font-semibold truncate">
                {viewMode === 'week' 
                  ? `${weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                }
              </h2>
              {filters.search && (
                <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">
                  {events.length} event{events.length !== 1 ? 's' : ''} found
                </Badge>
              )}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              GMT+05:30
            </div>
          </div>

          {/* Event Status Legend */}
          <div className="mt-4 p-3 bg-muted/20 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">Event Status Legend</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
                <span>Published</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></div>
                <span>Pencil Hold</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
                <span>Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          {viewMode === 'week' ? (
            /* Weekly Calendar View */
            <>
              {/* Mobile Compact View */}
              <div className="block sm:hidden">
                <div className="space-y-2 p-4">
                  {weekDates.map((date, dayIndex) => {
                    const isCurrentDay = isToday(date);
                    const dayEvents = getEventsForDate(date);
                    
                    return (
                      <div key={date.toISOString()} className="border rounded-lg p-3">
                        <div className={`flex items-center justify-between mb-2 ${
                          isCurrentDay ? 'text-primary' : 'text-foreground'
                        }`}>
                          <div className="font-semibold">
                            {dayNames[dayIndex]} {date.getDate()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <Link
                              key={event._id}
                              href={getEventUrl(event)}
                              className={`block p-2 rounded border-l-2 hover:bg-muted/50 transition-colors ${
                                event.status === 'pencil_hold'
                                  ? 'bg-orange-50 border-l-orange-500'
                                  : event.status === 'pencil_hold_confirmed'
                                    ? 'bg-blue-50 border-l-blue-500'
                                    : event.status === 'published'
                                      ? 'bg-green-50 border-l-green-500'
                                      : event.status === 'draft'
                                        ? 'bg-yellow-50 border-l-yellow-500'
                                        : event.status === 'cancelled'
                                          ? 'bg-red-50 border-l-red-500'
                                          : 'bg-muted/30'
                              }`}
                              style={{
                                borderLeftColor: event.status === 'pencil_hold'
                                  ? '#f97316'
                                  : event.status === 'pencil_hold_confirmed'
                                    ? '#3b82f6'
                                    : event.status === 'published'
                                      ? '#22c55e'
                                      : event.status === 'draft'
                                        ? '#eab308'
                                        : event.status === 'cancelled'
                                          ? '#ef4444'
                                          : event.category?.color || '#3b82f6'
                              }}
                            >
                              <div className="font-medium text-sm truncate">{event.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatEventTime(event)}
                              </div>
                              {(event.status === 'pencil_hold' || event.status === 'pencil_hold_confirmed') && (
                                <div className={`font-medium text-xs ${
                                  event.status === 'pencil_hold' ? 'text-orange-600' : 'text-blue-600'
                                }`}>
                                  {getEventStatusDisplay(event.status)}
                                </div>
                              )}
                            </Link>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{dayEvents.length - 3} more events
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Weekly View */}
              <div className="hidden sm:flex overflow-x-auto">
              {/* Time Column */}
              <div className="w-12 sm:w-16 flex-shrink-0 border-r">
                <div className="h-12 border-b"></div>
                {timeSlots.map((slot) => (
                  <div key={slot.hour} className="h-12 border-b border-gray-100 flex items-start justify-end pr-1 sm:pr-2 pt-1">
                    <span className="text-xs text-muted-foreground hidden sm:block">{slot.label}</span>
                    <span className="text-xs text-muted-foreground sm:hidden">{slot.hour === 12 ? '12' : slot.hour > 12 ? slot.hour - 12 : slot.hour}</span>
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="flex-1 flex min-w-0">
                {weekDates.map((date, dayIndex) => {
                  const isCurrentDay = isToday(date);
                  const isPast = isPastDate(date);
                  
                  return (
                    <div key={date.toISOString()} className="flex-1 min-w-0 border-r last:border-r-0">
                      {/* Day Header */}
                      <div className={`h-12 border-b flex items-center justify-center ${
                        isCurrentDay ? 'bg-primary text-primary-foreground' : 'bg-muted/30'
                      }`}>
                        <div className="text-center px-1">
                          <div className="text-xs sm:text-sm font-semibold">{dayNames[dayIndex]}</div>
                          <div className="text-xs">{date.getDate()}</div>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="relative">
                        {/* Time slot grid lines */}
                        {timeSlots.map((slot) => (
                          <div key={slot.hour} className="h-12 border-b border-gray-100"></div>
                        ))}
                        
                        {/* Events container - positioned absolutely over the grid */}
                        <div className="absolute inset-0 pointer-events-none">
                          {getEventsForDate(date).map((event, eventIndex) => {
                            const eventStart = new Date(event.startDate);
                            const eventEnd = new Date(event.endDate);
                            const eventStartHour = eventStart.getHours();
                            const eventStartMinute = eventStart.getMinutes();
                            const eventEndHour = eventEnd.getHours();
                            const eventEndMinute = eventEnd.getMinutes();
                            
                            const startTimeInHours = eventStartHour + (eventStartMinute / 60);
                            const endTimeInHours = eventEndHour + (eventEndMinute / 60);
                            const durationInHours = endTimeInHours - startTimeInHours;
                            
                            // Calculate position from the top of the day (not relative to a specific hour)
                            const top = (startTimeInHours - 1) * 48 + 'px'; // 48px per hour, starting from 1 AM
                            const height = durationInHours * 48 + 'px';
                            
                            return (
                              <Link
                                key={event._id}
                                href={getEventUrl(event)}
                                className="absolute group cursor-pointer pointer-events-auto"
                                style={{
                                  top: top,
                                  height: height,
                                  left: '2px',
                                  right: '2px',
                                  zIndex: 10 + eventIndex
                                }}
                              >
                                <div className={`h-full rounded-sm border-l-2 p-1 text-xs transition-all duration-200 group-hover:shadow-md ${
                                  event.status === 'pencil_hold'
                                    ? 'border-l-orange-500 bg-orange-50 group-hover:bg-orange-100'
                                    : event.status === 'pencil_hold_confirmed'
                                      ? 'border-l-blue-500 bg-blue-50 group-hover:bg-blue-100'
                                      : event.status === 'published'
                                        ? 'border-l-green-500 bg-green-50 group-hover:bg-green-100'
                                        : event.status === 'draft'
                                          ? 'border-l-yellow-500 bg-yellow-50 group-hover:bg-yellow-100'
                                          : event.status === 'cancelled'
                                            ? 'border-l-red-500 bg-red-50 group-hover:bg-red-100'
                                            : event.category?.color 
                                              ? `border-l-[${event.category.color}] bg-[${event.category.color}10] group-hover:bg-[${event.category.color}20]`
                                              : 'border-l-blue-500 bg-blue-50 group-hover:bg-blue-100'
                                }`}>
                                  <div className="font-medium text-foreground truncate">
                                    <span className="hidden sm:inline">{event.title}</span>
                                    <span className="sm:hidden">{event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}</span>
                                  </div>
                                  <div className="text-muted-foreground truncate hidden sm:block">
                                    {formatEventTime(event)}
                                  </div>
                                  {/* Status Indicator */}
                                  {(event.status === 'pencil_hold' || event.status === 'pencil_hold_confirmed') && (
                                    <div className={`font-medium text-xs truncate ${
                                      event.status === 'pencil_hold' ? 'text-orange-600' : 'text-blue-600'
                                    }`}>
                                      {getEventStatusDisplay(event.status)}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </>
          ) : (
            /* Monthly Calendar View (existing) */
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground bg-muted/30 rounded-lg">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {getDaysInMonth(currentDate).map((date, index) => {
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
                              event.status === 'pencil_hold'
                                ? 'border-orange-200 bg-orange-50 group-hover:bg-orange-100'
                                : event.status === 'pencil_hold_confirmed'
                                  ? 'border-blue-200 bg-blue-50 group-hover:bg-blue-100'
                                  : event.status === 'published'
                                    ? 'border-green-200 bg-green-50 group-hover:bg-green-100'
                                    : event.status === 'draft'
                                      ? 'border-yellow-200 bg-yellow-50 group-hover:bg-yellow-100'
                                      : event.status === 'cancelled'
                                        ? 'border-red-200 bg-red-50 group-hover:bg-red-100'
                                        : event.category?.color 
                                          ? `border-[${event.category.color}20] bg-[${event.category.color}10] group-hover:bg-[${event.category.color}20]`
                                          : 'border-blue-200 bg-blue-50 group-hover:bg-blue-100'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {formatEventTime(event)}
                                  </span>
                                </div>
                                <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                                  {getEventStatusDisplay(event.status)}
                                </div>
                              </div>
                              <div className="font-medium text-foreground truncate mb-1">
                                {event.title}
                              </div>
                              
                              {/* Pencil Hold Specific Information */}
                              {(event.status === 'pencil_hold' || event.status === 'pencil_hold_confirmed') && event.pencilHoldInfo && (
                                <div className="mb-2 p-1.5 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <div className="flex items-center gap-1 text-orange-700 font-medium mb-1">
                                    <Clock className="h-3 w-3" />
                                    Expires: {new Date(event.pencilHoldInfo.expiresAt).toLocaleDateString()} at {new Date(event.pencilHoldInfo.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {event.pencilHoldInfo.notes && (
                                    <div className="text-orange-600 text-xs line-clamp-1">
                                      {event.pencilHoldInfo.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                              
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
          )}
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
                      <Badge variant="outline" className={`${
                        event.status === 'published' ? 'text-green-600 border-green-200' :
                        event.status === 'pencil_hold' ? 'text-orange-600 border-orange-200' :
                        event.status === 'pencil_hold_confirmed' ? 'text-blue-600 border-blue-200' :
                        'text-yellow-600 border-yellow-200'
                      }`}>
                        {getEventStatusDisplay(event.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                    
                    {/* Pencil Hold Information */}
                    {(event.status === 'pencil_hold' || event.status === 'pencil_hold_confirmed') && event.pencilHoldInfo && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                        <div className="flex items-center gap-1 text-orange-700 font-medium mb-1">
                          <Clock className="h-3 w-3" />
                          Expires: {new Date(event.pencilHoldInfo.expiresAt).toLocaleDateString()} at {new Date(event.pencilHoldInfo.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {event.pencilHoldInfo.notes && (
                          <div className="text-orange-600 text-xs line-clamp-2">
                            {event.pencilHoldInfo.notes}
                          </div>
                        )}
                      </div>
                    )}
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
