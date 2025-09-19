'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
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
  MoreHorizontal,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEvents } from '@/hooks/queries/useEvents';
import { useUsers } from '@/hooks/queries/useUsers';
import { useCategories } from '@/hooks/queries/useCategories';
import { useEventsWithPencilHolds } from '@/hooks/queries/usePencilHolds';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all events for admin
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useUsers({
    limit: 5
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Fetch events with pencil holds
  const { data: pencilHoldEventsData, isLoading: pencilHoldEventsLoading } = useEventsWithPencilHolds({
    limit: 5,
    status: 'pencil_hold'
  });

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Admin access required.</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const events = eventsData?.data?.events || [];
  const users = usersData?.data?.users || [];
  const categories = categoriesData?.data?.categories || [];
  const pencilHoldEvents = pencilHoldEventsData?.data?.events || [];
  
  // Calculate stats
  const totalEvents = events.length;
  const publishedEvents = events.filter(event => event.status === 'published').length;
  const pendingEvents = events.filter(event => event.status === 'pending_approval').length;
  const totalUsers = users.length;
  const totalOrganizers = users.filter(user => user.role === 'organizer').length;
  const totalAdmins = users.filter(user => user.role === 'admin').length;
  const totalCategories = categories.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.name}! Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Administrator
            </Badge>
          </div>
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
                {publishedEvents} published, {pendingEvents} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {totalOrganizers} organizers, {totalAdmins} admins
              </p>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Event categories
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
                    Latest events across the platform
                  </CardDescription>
                </div>
                <Link href="/admin/events">
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
                  <p className="text-muted-foreground">No events yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location?.name || event.location?.address || 'Location TBD'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={
                              event.status === 'published' ? 'default' : 
                              event.status === 'pending_approval' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {event.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {event.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Link href={`/events/${event.slug}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/edit`}>
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

          {/* Pencil Hold Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pencil Hold Events
                  </CardTitle>
                  <CardDescription>
                    Events with active pencil holds waiting for confirmation
                  </CardDescription>
                </div>
                <Link href="/admin/events?status=pencil_hold">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pencilHoldEventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : pencilHoldEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pencil hold events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pencilHoldEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location?.name || event.location?.address || 'Location TBD'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            Pencil Hold
                          </Badge>
                          {event.pencilHoldInfo && (
                            <Badge variant="secondary" className="text-xs">
                              Expires: {new Date(event.pencilHoldInfo.expiresAt).toLocaleDateString()}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            by {event.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                        {event.pencilHoldInfo?.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {event.pencilHoldInfo.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Link href={`/admin/events/${event._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/edit`}>
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

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>
                    Latest registered users
                  </CardDescription>
                </div>
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.slice(0, 3).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{user.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
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
              Administrative tasks and management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/admin/events">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Events</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Categories</span>
                </Button>
              </Link>
              <Link href="/admin/whitelist">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span>Whitelist</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Platform health and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Platform Status</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Growth Rate</p>
                  <p className="text-xs text-muted-foreground">+12% this month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pending Reviews</p>
                  <p className="text-xs text-muted-foreground">{pendingEvents} events</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
