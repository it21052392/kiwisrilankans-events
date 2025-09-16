'use client';

import { EventCard } from './EventCard';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  category?: {
    _id: string;
    name: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  location?: {
    name: string;
    address: string;
    city: string;
  };
  capacity: number;
  price: number;
  currency: string;
  status: string;
  slug?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
}

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: Error | null;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onSave?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function EventList({
  events,
  isLoading = false,
  error = null,
  variant = 'default',
  showActions = true,
  onSave,
  onShare,
  emptyMessage = 'No Events Found',
  emptyDescription = 'No events match your current filters. Try adjusting your search criteria.'
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title="Error Loading Events"
        description="There was an error loading the events. Please try again later."
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            variant="compact"
            showActions={showActions}
            onSave={onSave}
            onShare={onShare}
          />
        ))}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            variant="featured"
            showActions={showActions}
            onSave={onSave}
            onShare={onShare}
          />
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          variant="default"
          showActions={showActions}
          onSave={onSave}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
