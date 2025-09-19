'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { formatEventTime, formatEventDate } from '@/lib/time-utils';
import { useEvent, useApproveEvent, useRejectEvent } from '@/hooks/queries/useEvents';
import { EventImageGallery } from '@/components/events/EventImageGallery';
import Link from 'next/link';

export default function AdminEventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  // Fetch event data
  const { data: eventData, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  
  // Mutations
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const event = eventData?.data?.event;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: AlertCircle },
      pending_approval: { variant: 'outline' as const, label: 'Pending Approval', icon: Clock },
      published: { variant: 'default' as const, label: 'Published', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      unpublished: { variant: 'secondary' as const, label: 'Unpublished', icon: AlertCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle },
      completed: { variant: 'outline' as const, label: 'Completed', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: 'secondary' as const, 
      label: status, 
      icon: AlertCircle 
    };
    
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleApproveEvent = async () => {
    if (!event) return;
    
    try {
      await approveEventMutation.mutateAsync(event._id);
      router.push('/admin/events');
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const handleRejectEvent = async () => {
    if (!event) return;
    
    try {
      await rejectEventMutation.mutateAsync(event._id);
      router.push('/admin/events');
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  if (eventLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (eventError || !event) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/events')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
              <p className="text-muted-foreground mt-1">{event.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(event.status)}
            <Link href={`/admin/events/${event._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-10">
          {/* Event Images */}
          {event.images && event.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Event Images
              </h3>
              <EventImageGallery
                images={event.images.map((img, index) => ({
                  id: `event-${index}`,
                  filename: img.url.split('/').pop() || `image-${index}`,
                  originalName: img.alt || `Event image ${index + 1}`,
                  url: img.url,
                  size: 0,
                  type: 'image/jpeg',
                  uploadType: 'event_image',
                  uploadedBy: '',
                  uploadedAt: new Date().toISOString(),
                  isPrimary: img.isPrimary || index === 0
                }))}
                showPrimaryBadge={true}
                allowFullscreen={true}
                aspectRatio="video"
              />
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Date & Time */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Date:</span>
                      <div className="text-sm font-medium">{formatEventDate(event)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Time:</span>
                      <div className="text-sm font-medium">
                        {formatEventTime(event)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{event.location?.name || 'Location TBD'}</div>
                      {event.location?.address && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.location.address}
                        </div>
                      )}
                      {event.location?.city && (
                        <div className="text-sm text-muted-foreground">
                          {event.location.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capacity & Pricing */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5" />
                  Capacity & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Capacity:</span>
                      <div className="text-sm font-medium">{event.capacity} capacity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Price:</span>
                      <div className="text-sm font-medium">
                        {event.price === 0 ? 'Free' : `$${event.price} ${event.currency}`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Organizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Name:</span>
                      <div className="text-sm font-medium">{event.createdBy?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Email:</span>
                      <div className="text-sm font-medium break-all">{event.contactInfo?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Phone:</span>
                      <div className="text-sm font-medium">{event.contactInfo?.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {event.category?.name || 'No Category'}
                </Badge>
              </CardContent>
            </Card>

            {event.tags && event.tags.length > 0 && (
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {event.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-foreground leading-relaxed">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Event Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Created:</span>
                  <div className="text-foreground">{format(new Date(event.createdAt), 'MMM do, yyyy h:mm a')}</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Last Updated:</span>
                  <div className="text-foreground">{format(new Date(event.updatedAt), 'MMM do, yyyy h:mm a')}</div>
                </div>
                <div className="space-y-1 md:col-span-3">
                  <span className="font-medium text-muted-foreground">Event ID:</span>
                  <div className="text-foreground font-mono text-xs break-all">{event._id}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {(event.status === 'pending_approval' || event.status === 'draft') && (
          <>
            <Separator className="my-6" />
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.push('/admin/events')} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectEvent}
                disabled={rejectEventMutation.isPending}
                className="w-full sm:w-auto"
              >
                {rejectEventMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={handleApproveEvent}
                disabled={approveEventMutation.isPending}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {approveEventMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
