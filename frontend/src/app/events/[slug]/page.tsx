'use client';

import { useParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useEventBySlug } from '@/hooks/queries/useEvents';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Share2, 
  Heart,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Tag,
  User,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatEventTime, formatEventDate } from '@/lib/time-utils';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: eventData, isLoading, error } = useEventBySlug(slug);
  const event = eventData?.data?.event;

  // Debug: Log event data to console
  console.log('Event data:', eventData);
  console.log('Event:', event);
  console.log('Event images:', event?.images);
  console.log('First image URL:', event?.images?.[0]?.url);
  console.log('Image URL type:', typeof event?.images?.[0]?.url);
  console.log('Is S3 URL:', event?.images?.[0]?.url?.includes('.s3.'));

  if (isLoading) {
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

  if (error || !event) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="Event Not Found"
            description="The event you're looking for doesn't exist or has been removed."
            action={
              <Link href="/events">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Events
                </Button>
              </Link>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isPastEvent = new Date(event.endDate) < new Date();
  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{event.category?.name || 'Event'}</Badge>
                <Badge 
                  variant="outline" 
                  className={`${
                    event.status === 'published' 
                      ? 'text-green-600 border-green-600' 
                      : event.status === 'pending_approval'
                        ? 'text-yellow-600 border-yellow-600'
                        : 'text-gray-600 border-gray-600'
                  }`}
                >
                  {event.status.replace('_', ' ')}
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
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {event.description}
              </p>

              <div className="flex items-center gap-4">
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Save Event
                </Button>
              </div>
            </div>

            {/* Event Image */}
            {event.images && event.images.length > 0 && event.images[0]?.url ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={event.images[0].url} 
                  alt={event.images[0].alt || event.title}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('Image loaded successfully:', event.images[0].url)}
                  onError={(e) => {
                    console.error('Image failed to load:', event.images[0].url, e);
                    // Hide the image and show placeholder if it fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary" />
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-16 w-16 text-primary" />
                <div className="text-sm text-gray-500 mt-2">No images available</div>
              </div>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">Date & Time</div>
                      <div className="text-sm text-muted-foreground">
                        {formatEventDate(event)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatEventTime(event)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">Location</div>
                      <div className="text-sm text-muted-foreground">
                        {event.location?.name || 'Location TBD'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.location?.address || 'Address to be confirmed'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">Capacity</div>
                      <div className="text-sm text-muted-foreground">
                        {event.capacity} people
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">Price</div>
                      <div className="text-sm text-muted-foreground">
                        {event.price === 0 ? 'Free' : `$${event.price} ${event.currency}`}
                      </div>
                    </div>
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Requirements</div>
                    <ul className="space-y-1">
                      {event.requirements.map((requirement, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {event.contactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{event.contactInfo.name}</div>
                        <div className="text-sm text-muted-foreground">Event Organizer</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{event.contactInfo.email}</div>
                        <div className="text-sm text-muted-foreground">Email</div>
                      </div>
                    </div>
                    
                    {event.contactInfo.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold">{event.contactInfo.phone}</div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Event Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPastEvent && (
                  <Button disabled className="w-full">
                    Event Has Ended
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Save Event
                </Button>
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{event.status}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-semibold">{event.capacity}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-semibold">
                    {format(new Date(event.createdAt), 'MMM do, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{event.createdBy?.name || 'Event Organizer'}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.createdBy?.role || 'Organizer'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
