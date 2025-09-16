'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  FileText,
  Timer
} from 'lucide-react';
import { useMyPencilHolds, useCreatePencilHold, useUpdatePencilHold, useDeletePencilHold, useConfirmPencilHold } from '@/hooks/queries/usePencilHolds';
import { useEvents } from '@/hooks/queries/useEvents';
import { pencilHoldsService, CreatePencilHoldData } from '@/services/pencil-holds.service';
import toast from 'react-hot-toast';
import { format, addHours, isAfter, isBefore } from 'date-fns';

export default function OrganizerPencilHoldsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPencilHold, setEditingPencilHold] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form state for creating/editing pencil holds
  const [formData, setFormData] = useState<CreatePencilHoldData>({
    eventId: '',
    notes: '',
    additionalInfo: {},
    priority: 5,
    expiresAt: ''
  });

  // Fetch organizer's pencil holds
  const { data: pencilHoldsData, isLoading: pencilHoldsLoading, refetch } = useMyPencilHolds({
    page: 1,
    limit: 50
  });

  // Fetch events for creating pencil holds (include draft and published events)
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    // Don't filter by status to include both draft and published events
    limit: 100,
    sortBy: 'startDate',
    sortOrder: 'asc'
  });

  // Mutations
  const createPencilHoldMutation = useCreatePencilHold();
  const updatePencilHoldMutation = useUpdatePencilHold();
  const deletePencilHoldMutation = useDeletePencilHold();
  const confirmPencilHoldMutation = useConfirmPencilHold();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'organizer') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user]); // Removed router from dependencies

  const pencilHolds = pencilHoldsData?.data?.pencilHolds || [];
  const events = eventsData?.data?.events || [];

  // Filter pencil holds based on search and status
  const filteredPencilHolds = pencilHolds.filter(hold => {
    const matchesSearch = !searchTerm || 
      hold.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hold.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || hold.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = isAfter(new Date(), new Date(expiresAt));
    
    if (isExpired && status === 'pending') {
      return <Badge variant="destructive">Expired</Badge>;
    }

    const statusConfig = {
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      confirmed: { variant: 'secondary' as const, label: 'Confirmed', icon: CheckCircle },
      converted: { variant: 'default' as const, label: 'Converted', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle },
      expired: { variant: 'destructive' as const, label: 'Expired', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: 'secondary' as const, 
      label: status, 
      icon: Clock 
    };
    
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (diffInHours === 0) return 'Expired';
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    return `${Math.ceil(diffInHours / 24)}d remaining`;
  };

  const handleCreatePencilHold = async () => {
    if (!formData.eventId || !formData.notes.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Set expiry to 48 hours from now
      const expiresAt = addHours(new Date(), 48).toISOString();
      
      await createPencilHoldMutation.mutateAsync({
        ...formData,
        expiresAt
      });
      
      toast.success('Pencil hold created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        eventId: '',
        notes: '',
        additionalInfo: {},
        priority: 5,
        expiresAt: ''
      });
      refetch();
    } catch (error) {
      console.error('Error creating pencil hold:', error);
      toast.error('Failed to create pencil hold. Please try again.');
    }
  };

  const handleUpdatePencilHold = async () => {
    if (!editingPencilHold || !formData.notes.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updatePencilHoldMutation.mutateAsync({
        id: editingPencilHold._id,
        data: formData
      });
      
      toast.success('Pencil hold updated successfully');
      setIsEditModalOpen(false);
      setEditingPencilHold(null);
      setFormData({
        eventId: '',
        notes: '',
        additionalInfo: {},
        priority: 5,
        expiresAt: ''
      });
      refetch();
    } catch (error) {
      console.error('Error updating pencil hold:', error);
      toast.error('Failed to update pencil hold. Please try again.');
    }
  };

  const handleDeletePencilHold = async (pencilHoldId: string) => {
    setIsDeleting(pencilHoldId);
    try {
      await deletePencilHoldMutation.mutateAsync(pencilHoldId);
      toast.success('Pencil hold deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting pencil hold:', error);
      toast.error('Failed to delete pencil hold. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleConfirmPencilHold = async (pencilHoldId: string) => {
    try {
      await confirmPencilHoldMutation.mutateAsync(pencilHoldId);
      toast.success('Pencil hold confirmed successfully');
      refetch();
    } catch (error) {
      console.error('Error confirming pencil hold:', error);
      toast.error('Failed to confirm pencil hold. Please try again.');
    }
  };

  const openEditModal = (pencilHold: any) => {
    setEditingPencilHold(pencilHold);
    setFormData({
      eventId: pencilHold.eventId,
      notes: pencilHold.notes,
      additionalInfo: pencilHold.additionalInfo || {},
      priority: pencilHold.priority,
      expiresAt: pencilHold.expiresAt
    });
    setIsEditModalOpen(true);
  };

  if (!isAuthenticated || !user || user.role !== 'organizer') {
    return null;
  }

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pencil Holds</h1>
            <p className="text-muted-foreground mt-1">
              Manage your 48-hour event slot bookings
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Pencil Hold
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Pencil Hold</DialogTitle>
                <DialogDescription>
                  Reserve a 48-hour slot for an event. This will expire automatically if not confirmed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventId">Event *</Label>
                  <Select
                    value={formData.eventId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.title} - {format(new Date(event.startDate), 'MMM do, yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes *</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this pencil hold..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (1-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires In</Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      48 hours
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePencilHold}
                    disabled={createPencilHoldMutation.isPending}
                  >
                    {createPencilHoldMutation.isPending ? 'Creating...' : 'Create Pencil Hold'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pencil holds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pencil Holds List */}
        {pencilHoldsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPencilHolds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No pencil holds found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No pencil holds match your current filters. Try adjusting your search criteria.'
                  : "You haven't created any pencil holds yet. Create your first pencil hold to get started!"
                }
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Pencil Hold
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPencilHolds.map((pencilHold) => (
              <Card key={pencilHold._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{pencilHold.event?.title || 'Event Not Found'}</CardTitle>
                        {getStatusBadge(pencilHold.status, pencilHold.expiresAt)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {pencilHold.notes}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {pencilHold.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmPencilHold(pencilHold._id)}
                          disabled={confirmPencilHoldMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(pencilHold)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting === pencilHold._id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isDeleting === pencilHold._id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        }
                        title="Delete Pencil Hold"
                        description={`Are you sure you want to delete this pencil hold? This action cannot be undone.`}
                        variant="destructive"
                        onConfirm={() => handleDeletePencilHold(pencilHold._id)}
                        confirmText="Delete"
                        cancelText="Cancel"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {pencilHold.event?.startDate 
                          ? format(new Date(pencilHold.event.startDate), 'MMM do, yyyy')
                          : 'Date TBD'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {pencilHold.event?.location?.name || 'Location TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(pencilHold.expiresAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Priority: {pencilHold.priority}/10</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created {format(new Date(pencilHold.createdAt), 'MMM do, yyyy')}
                      </div>
                    </div>
                    {pencilHold.additionalInfo && Object.keys(pencilHold.additionalInfo).length > 0 && (
                      <Badge variant="outline">Additional Info</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Pencil Hold</DialogTitle>
              <DialogDescription>
                Update your pencil hold details. Note: You cannot change the event or expiry time.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Event</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {editingPencilHold?.event?.title || 'Event Not Found'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes *</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this pencil hold..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority (1-10)</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdatePencilHold}
                  disabled={updatePencilHoldMutation.isPending}
                >
                  {updatePencilHoldMutation.isPending ? 'Updating...' : 'Update Pencil Hold'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Summary */}
        {pencilHolds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pencil Hold Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{pencilHolds.length}</div>
                  <div className="text-sm text-muted-foreground">Total Holds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {pencilHolds.filter(h => h.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pencilHolds.filter(h => h.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pencilHolds.filter(h => h.status === 'converted').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Converted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {pencilHolds.filter(h => h.status === 'expired' || h.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Expired/Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OrganizerLayout>
  );
}
