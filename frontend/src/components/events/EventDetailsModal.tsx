'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/store/event-store';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  isApproving = false,
  isRejecting = false
}: EventDetailsModalProps) {
  if (!event) return null;

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

  return (
    <div className="full-width-dialog">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-h-[95vh] overflow-y-auto mx-4"
        >
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-2 text-foreground break-words">
                {event.title}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                {event.description}
              </DialogDescription>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(event.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-10">
          {/* Event Images */}
          {event.images && event.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <ImageIcon className="h-5 w-5" />
                Event Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {event.images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border shadow-sm">
                    <img
                      src={image.url}
                      alt={image.alt || `Event image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
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
                      <span className="font-medium text-sm text-muted-foreground">Start Date:</span>
                      <div className="text-sm font-medium">{format(new Date(event.startDate), 'EEEE, MMMM do, yyyy')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-muted-foreground">Time:</span>
                      <div className="text-sm font-medium">
                        {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  {event.registrationDeadline && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-sm text-muted-foreground">Registration Deadline:</span>
                        <div className="text-sm font-medium">{format(new Date(event.registrationDeadline), 'MMM do, yyyy h:mm a')}</div>
                      </div>
                    </div>
                  )}
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
                      <div className="text-sm font-medium">{event.attendeeCount || 0} / {event.capacity} attendees</div>
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
        {(event.status === 'pending_approval' || event.status === 'draft') && (onApprove || onReject) && (
          <>
            <Separator className="my-6" />
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Close
              </Button>
              {onReject && (
                <Button
                  variant="destructive"
                  onClick={() => onReject(event._id)}
                  disabled={isRejecting}
                  className="w-full sm:w-auto"
                >
                  {isRejecting ? (
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
              )}
              {onApprove && (
                <Button
                  onClick={() => onApprove(event._id)}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {isApproving ? (
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
              )}
            </div>
          </>
        )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
