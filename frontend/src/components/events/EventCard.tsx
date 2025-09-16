'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart,
  Share2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
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
  };
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onSave?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  variant = 'default', 
  showActions = true,
  onSave,
  onShare 
}: EventCardProps) {
  const isPastEvent = new Date(event.endDate) < new Date();
  const isUpcoming = new Date(event.startDate) > new Date();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(event._id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(event._id);
  };

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.slug || event._id}`}>
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {event.category?.name || 'Event'}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      event.status === 'published' 
                        ? 'text-green-600 border-green-600' 
                        : 'text-yellow-600 border-yellow-600'
                    }`}
                  >
                    {event.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.startDate), 'MMM do')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location?.city || 'TBD'}
                  </div>
                  <div className="font-semibold text-primary">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {showActions && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className="h-8 w-8 p-0"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="h-8 w-8 p-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/events/${event.slug || event._id}`}>
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{event.category?.name || 'Event'}</Badge>
              <Badge 
                variant="outline" 
                className={`${
                  event.status === 'published' 
                    ? 'text-green-600 border-green-600' 
                    : 'text-yellow-600 border-yellow-600'
                }`}
              >
                {event.status}
              </Badge>
              {isPastEvent && (
                <Badge variant="outline" className="text-gray-600 border-gray-600">
                  Past Event
                </Badge>
              )}
              {isUpcoming && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Upcoming
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(event.startDate), 'EEEE, MMMM do, yyyy')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location?.name || 'Location TBD'}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  {event.capacity} capacity
                </div>
                <div className="text-lg font-semibold text-primary">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </div>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              <div className="pt-2">
                <Button className="w-full group-hover:bg-primary/90 transition-colors">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/events/${event.slug || event._id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardHeader>
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-primary" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{event.category?.name || 'Event'}</Badge>
            <Badge 
              variant="outline" 
              className={`${
                event.status === 'published' 
                  ? 'text-green-600 border-green-600' 
                  : 'text-yellow-600 border-yellow-600'
              }`}
            >
              {event.status}
            </Badge>
          </div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(event.startDate), 'MMM do, yyyy')}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location?.name || 'Location TBD'}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1" />
                {event.capacity} capacity
              </div>
              <div className="text-lg font-semibold text-primary">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  className="flex-1"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            )}
            <div className="pt-2">
              <Button className="w-full">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
