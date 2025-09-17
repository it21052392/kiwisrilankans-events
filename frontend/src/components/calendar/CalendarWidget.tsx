'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useCalendarEvents } from '@/hooks/queries/useEvents';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users,
  Star,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatEventTime as formatEventTimeUtil } from '@/lib/time-utils';

interface CalendarWidgetProps {
  showTitle?: boolean;
  showNavigation?: boolean;
  maxEvents?: number;
  className?: string;
}

export function CalendarWidget({ 
  showTitle = true, 
  showNavigation = true, 
  maxEvents = 6,
  className = ''
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useCalendarEvents({});
  const events = eventsData?.data?.events || [];
  const eventsByDate = eventsData?.data?.eventsByDate || {};

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

  // Get days in month for month view
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

  // Calculate event position and height based on start/end times
  const getEventPosition = (event: any, slotHour: number) => {
    // Use startTime and endTime fields if available, otherwise fall back to startDate/endDate
    let eventStartHour, eventStartMinute, eventEndHour, eventEndMinute;
    
    if (event.startTime && event.endTime) {
      // Parse time strings like "08:00" and "12:00"
      const [startHour, startMin] = event.startTime.split(':').map(Number);
      const [endHour, endMin] = event.endTime.split(':').map(Number);
      eventStartHour = startHour;
      eventStartMinute = startMin;
      eventEndHour = endHour;
      eventEndMinute = endMin;
    } else {
      // Fallback to using startDate and endDate
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStartHour = eventStart.getHours();
      eventStartMinute = eventStart.getMinutes();
      eventEndHour = eventEnd.getHours();
      eventEndMinute = eventEnd.getMinutes();
    }
    
    const startTimeInHours = eventStartHour + (eventStartMinute / 60);
    const endTimeInHours = eventEndHour + (eventEndMinute / 60);
    const durationInHours = endTimeInHours - startTimeInHours;
    
    // Calculate position within the slot (each slot is 1 hour = 48px)
    const slotHeight = 48; // 48px per hour slot
    const top = ((startTimeInHours - slotHour) * slotHeight) + 'px';
    const height = (durationInHours * slotHeight) + 'px';
    
    return { top, height };
  };

  const weekDates = getWeekDates(currentDate);
  const timeSlots = getTimeSlots();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get upcoming events for the list view
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, maxEvents);

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Event Calendar</h2>
            <p className="text-muted-foreground">
              Stay updated with upcoming events
            </p>
          </div>
          <Link href="/events/calendar">
            <Button variant="outline" size="sm">
              View Full Calendar
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {eventsLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : eventsError ? (
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
          title="Error Loading Calendar"
          description="There was an error loading the calendar. Please try again later."
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
          title="No Events Scheduled"
          description="There are no events scheduled at the moment. Check back later!"
        />
      ) : (
        <>
          {/* Calendar View Toggle */}
          {showNavigation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {viewMode === 'week'
                    ? `${weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  }
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Calendar Display */}
          {viewMode === 'week' ? (
            /* Week View */
            <div className="border rounded-lg overflow-hidden">
              <div className="flex min-h-[400px]">
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
                          {getEventsForDate(date)
                            .slice(0, 6) // Limit to 6 events per day for widget
                            .map((event, eventIndex) => {
                              // Use startTime and endTime fields if available, otherwise fall back to startDate/endDate
                              let eventStartHour, eventStartMinute, eventEndHour, eventEndMinute;
                              
                              if (event.startTime && event.endTime) {
                                // Parse time strings like "08:00" and "12:00"
                                const [startHour, startMin] = event.startTime.split(':').map(Number);
                                const [endHour, endMin] = event.endTime.split(':').map(Number);
                                eventStartHour = startHour;
                                eventStartMinute = startMin;
                                eventEndHour = endHour;
                                eventEndMinute = endMin;
                              } else {
                                // Fallback to using startDate and endDate
                                const eventStart = new Date(event.startDate);
                                const eventEnd = new Date(event.endDate);
                                eventStartHour = eventStart.getHours();
                                eventStartMinute = eventStart.getMinutes();
                                eventEndHour = eventEnd.getHours();
                                eventEndMinute = eventEnd.getMinutes();
                              }
                              
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
                                        {formatEventTimeUtil(event)}
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
            </div>
          ) : (
            /* Month View */
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 gap-2 p-4">
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
                      className={`p-2 min-h-[80px] border rounded-lg transition-all duration-200 ${
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
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Link
                            key={event._id}
                            href={getEventUrl(event)}
                            className="block group"
                          >
                            <div className={`text-xs p-1.5 rounded border transition-all duration-200 group-hover:shadow-sm ${
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
                              <div className="font-medium text-foreground truncate text-xs">
                                {event.title}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatEventTimeUtil(event)}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Events List */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Next {upcomingEvents.length} events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      href={getEventUrl(event)}
                      className="block group"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-all">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            event.status === 'pencil_hold' ? 'bg-orange-500' :
                            event.status === 'pencil_hold_confirmed' ? 'bg-blue-500' :
                            event.status === 'published' ? 'bg-green-500' :
                            event.status === 'draft' ? 'bg-yellow-500' :
                            event.status === 'cancelled' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(event.startDate), 'MMM do')} {formatEventTimeUtil(event)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {getEventStatusDisplay(event.status)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
