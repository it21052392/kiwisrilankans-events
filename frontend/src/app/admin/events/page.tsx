'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  Calendar, 
  Search, 
  Edit, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useAdminEvents, useApproveEvent, useRejectEvent } from '@/hooks/queries/useEvents';
import { useCategories } from '@/hooks/queries/useCategories';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch all events for admin
  const { data: eventsData, isLoading: eventsLoading, refetch } = useAdminEvents({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' && statusFilter !== 'needs_approval' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50
  });

  // Fetch categories for filter
  const { data: categoriesData } = useCategories();

  // Mutations
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user]); // Removed router from dependencies

  const allEvents = eventsData?.data?.events || [];
  const categories = categoriesData?.data?.categories || [];

  // Filter events based on status filter
  const events = allEvents.filter(event => {
    if (statusFilter === 'needs_approval') {
      return event.status === 'draft' || event.status === 'pending_approval';
    }
    return true; // For other filters, the API handles it
  });

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setIsDetailsModalOpen(false);
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      await approveEventMutation.mutateAsync(eventId);
      toast.success('Event approved successfully');
      handleCloseDetails();
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Failed to approve event. Please try again.');
    }
  };

  const handleRejectEvent = async (eventId: string, reason: string) => {
    try {
      await rejectEventMutation.mutateAsync({ id: eventId, reason });
      toast.success('Event rejected successfully');
      handleCloseDetails();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast.error('Failed to reject event. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: AlertCircle },
      pencil_hold: { variant: 'outline' as const, label: 'Pencil Hold', icon: Clock },
      pencil_hold_confirmed: { variant: 'default' as const, label: 'Pencil Hold Confirmed', icon: CheckCircle },
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

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and moderate all events on the platform
            </p>
          </div>
          <Link href="/admin/events/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="needs_approval">Needs Approval</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pencil_hold">Pencil Hold</SelectItem>
                    <SelectItem value="pencil_hold_confirmed">Pencil Hold Confirmed</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
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
          </CardContent>
        </Card>

        {/* Events List */}
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No events match your current filters. Try adjusting your search criteria.'
                  : "No events have been created yet."
                }
              </p>
              <Link href="/admin/events/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        {getStatusBadge(event.status)}
                        {(event.status === 'pencil_hold' || event.status === 'pencil_hold_confirmed') && event.pencilHoldInfo && (
                          <Badge variant="outline" className="text-xs">
                            Expires: {format(new Date(event.pencilHoldInfo.expiresAt), 'MMM do, h:mm a')}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>by {event.createdBy?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{event.category?.name || 'No Category'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(event)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/events/${event._id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit Event">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {(event.status === 'pending_approval' || event.status === 'draft' || event.status === 'pencil_hold_confirmed') && (
                        <>
                          <ConfirmationDialog
                            trigger={
                              <Button
                                size="sm"
                                disabled={approveEventMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                                title="Approve Event"
                              >
                                {approveEventMutation.isPending ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            }
                            title="Approve Event"
                            description={`Are you sure you want to approve "${event.title}"? This will make the event visible to all users.`}
                            variant="success"
                            onConfirm={() => handleApproveEvent(event._id)}
                            confirmText="Approve"
                            cancelText="Cancel"
                          />
                          <ConfirmationDialog
                            trigger={
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={rejectEventMutation.isPending}
                                title="Reject Event"
                              >
                                {rejectEventMutation.isPending ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            }
                            title="Reject Event"
                            description={`Are you sure you want to reject "${event.title}"? Please provide a reason for rejection.`}
                            variant="destructive"
                            onConfirm={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                handleRejectEvent(event._id, reason);
                              }
                            }}
                            confirmText="Reject"
                            cancelText="Cancel"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.startDate), 'MMM do, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.startDate), 'h:mm a')}{event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.location?.name || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.capacity} capacity</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {event.price === 0 ? 'Free' : `$${event.price} ${event.currency}`}
                        </span>
                      </div>
                      <Badge variant="outline">{event.category?.name || 'No Category'}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created {format(new Date(event.createdAt), 'MMM do, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {allEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{allEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {allEvents.filter(e => e.status === 'draft' || e.status === 'pending_approval').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Need Approval</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {allEvents.filter(e => e.status === 'published').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {allEvents.filter(e => e.status === 'pending_approval').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {allEvents.filter(e => e.status === 'draft').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {allEvents.filter(e => e.status === 'rejected' || e.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Rejected/Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Details Modal */}
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          onApprove={handleApproveEvent}
          onReject={handleRejectEvent}
          isApproving={approveEventMutation.isPending}
          isRejecting={rejectEventMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}
