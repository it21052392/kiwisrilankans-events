'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Calendar, 
  Users, 
  Plus, 
  TrendingUp, 
  Clock, 
  MapPin,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useEvents } from '@/hooks/queries/useEvents';
import { useOrganizerPencilHolds } from '@/hooks/queries/usePencilHolds';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch organizer's events
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents({
    organizerId: user?.id,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch pencil holds
  const { data: pencilHoldsData, isLoading: pencilHoldsLoading } = useOrganizerPencilHolds({
    page: 1,
    limit: 5
  });

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </OrganizerLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <OrganizerLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  const events = eventsData?.data?.events || [];
  const pencilHolds = pencilHoldsData?.data?.pencilHolds || [];
  
  // Calculate stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date()).length;
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendeeCount || 0), 0);
  const pendingPencilHolds = pencilHolds.filter(hold => hold.status === 'pending').length;

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your events
            </p>
          </div>
          <Link href="/organizer/events/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">
                Across all events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pencil Holds</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pencilHolds.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPencilHolds} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(event => {
                  const eventDate = new Date(event.startDate);
                  const now = new Date();
                  return eventDate.getMonth() === now.getMonth() && 
                         eventDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Events created
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>
                    Your latest created events
                  </CardDescription>
                </div>
                <Link href="/organizer/events">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No events yet</p>
                  <Link href="/organizer/events/create">
                    <Button size="sm">Create your first event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location?.name || 'No location'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.attendeeCount || 0} attendees
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Link href={`/events/${event.slug}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/organizer/events/${event.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pencil Holds */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pencil Holds</CardTitle>
                  <CardDescription>
                    Recent venue booking requests
                  </CardDescription>
                </div>
                <Link href="/organizer/pencil-holds">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pencilHoldsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : pencilHolds.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pencil holds yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pencilHolds.slice(0, 3).map((hold) => (
                    <div key={hold._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{hold.event?.title || 'Event Not Found'}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {hold.event?.startDate ? new Date(hold.event.startDate).toLocaleDateString() : 'No date'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {hold.event?.startDate ? new Date(hold.event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time'}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            hold.status === 'approved' ? 'default' : 
                            hold.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                          className="mt-2"
                        >
                          {hold.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/organizer/events/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Create New Event</span>
                </Button>
              </Link>
              <Link href="/organizer/events">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Events</span>
                </Button>
              </Link>
              <Link href="/organizer/pencil-holds">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Pencil Holds</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizerLayout>
  );
}
