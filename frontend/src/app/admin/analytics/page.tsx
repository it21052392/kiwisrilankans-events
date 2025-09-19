'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Activity,
  Target,
  Award,
  Clock,
  MapPin
} from 'lucide-react';
import { useEvents } from '@/hooks/queries/useEvents';
import { useUsers } from '@/hooks/queries/useUsers';
import { useCategories } from '@/hooks/queries/useCategories';
import { usePencilHolds } from '@/hooks/queries/usePencilHolds';
import toast from 'react-hot-toast';
import { format, subDays, subMonths, subWeeks } from 'date-fns';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data for analytics
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useEvents({
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers({
    limit: 1000
  });

  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories({
    limit: 100
  });

  const { data: pencilHoldsData, isLoading: pencilHoldsLoading, refetch: refetchPencilHolds } = usePencilHolds({
    limit: 1000
  });

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user]); // Removed router from dependencies

  const events = eventsData?.data?.events || [];
  const users = usersData?.data?.users || [];
  const categories = categoriesData?.data?.categories || [];
  const pencilHolds = pencilHoldsData?.data?.pencilHolds || [];

  const isLoading = eventsLoading || usersLoading || categoriesLoading || pencilHoldsLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchEvents(),
        refetchUsers(),
        refetchCategories(),
        refetchPencilHolds()
      ]);
      toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return subDays(now, 7);
      case '30d':
        return subDays(now, 30);
      case '90d':
        return subDays(now, 90);
      case '1y':
        return subMonths(now, 12);
      default:
        return subDays(now, 30);
    }
  };

  const filterDataByTimeRange = (data: any[], dateField: string = 'createdAt') => {
    const cutoffDate = getTimeRangeDate();
    return data.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  const recentEvents = filterDataByTimeRange(events);
  const recentUsers = filterDataByTimeRange(users);
  const recentPencilHolds = filterDataByTimeRange(pencilHolds);

  // Calculate statistics
  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const pendingEvents = events.filter(e => e.status === 'pending_approval').length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.active).length;
  const totalPencilHolds = pencilHolds.length;
  const confirmedPencilHolds = pencilHolds.filter(p => p.status === 'confirmed').length;

  // Recent activity
  const recentActivity = [
    ...recentEvents.map(event => ({
      type: 'event',
      title: `New event: ${event.title}`,
      date: event.createdAt,
      user: event.createdBy?.name || 'Unknown'
    })),
    ...recentUsers.map(user => ({
      type: 'user',
      title: `New user: ${user.name}`,
      date: user.createdAt,
      user: user.name
    })),
    ...recentPencilHolds.map(hold => ({
      type: 'pencil_hold',
      title: `New pencil hold for: ${hold.event?.title || 'Unknown Event'}`,
      date: hold.createdAt,
      user: hold.user?.name || 'Unknown'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  // Category distribution
  const categoryDistribution = categories.map(category => ({
    name: category.name,
    count: events.filter(e => e.category?._id === category._id).length,
    color: category.color
  })).sort((a, b) => b.count - a.count);

  // Status distribution
  const eventStatusDistribution = [
    { status: 'Published', count: publishedEvents, color: '#10B981' },
    { status: 'Pending', count: pendingEvents, color: '#F59E0B' },
    { status: 'Draft', count: events.filter(e => e.status === 'draft').length, color: '#6B7280' },
    { status: 'Rejected', count: events.filter(e => e.status === 'rejected').length, color: '#EF4444' }
  ];

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Platform insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {recentEvents.length} in last {timeRange}
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
                {recentUsers.length} in last {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                {activeCategories} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pencil Holds</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPencilHolds}</div>
              <p className="text-xs text-muted-foreground">
                {confirmedPencilHolds} confirmed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Event Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of events by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventStatusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Category</CardTitle>
              <CardDescription>
                Most popular event categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryDistribution.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === 'event' && <Calendar className="h-4 w-4 text-primary" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === 'pencil_hold' && <Clock className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {format(new Date(activity.date), 'MMM do, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>
              System performance and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">System Status</h3>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Growth Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {recentEvents.length > 0 ? '+' : ''}{recentEvents.length} events this period
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Engagement</h3>
                <p className="text-sm text-muted-foreground">
                  {totalPencilHolds} pencil holds created
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
