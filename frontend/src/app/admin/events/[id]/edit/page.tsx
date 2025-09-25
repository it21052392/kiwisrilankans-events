'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Tag, 
  Phone, 
  Mail, 
  User,
  Plus,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useCategories } from '@/hooks/queries/useCategories';
import { useEvent, useUpdateEvent, useApproveEvent, useRejectEvent } from '@/hooks/queries/useEvents';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminEditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Fetch event data
  const { data: eventData, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  
  // Update event mutation (admin version)
  const updateEventMutation = useUpdateEvent();
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    location: {
      name: '',
      address: '',
      city: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    capacity: 50,
    price: 0,
    currency: 'NZD',
    images: [] as Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>,
    tags: [] as string[],
    requirements: [] as string[],
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user]); // Removed router from dependencies

  useEffect(() => {
    if (eventData?.data?.event) {
      const event = eventData.data.event;
      
      // Helper function to format date for datetime-local input
      const formatDateForInput = (dateField: string) => {
        if (!dateField) return '';
        const date = new Date(dateField);
        return date.toISOString().slice(0, 16);
      };
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category?._id || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        location: {
          name: event.location?.name || '',
          address: event.location?.address || '',
          city: event.location?.city || '',
          coordinates: event.location?.coordinates || { latitude: 0, longitude: 0 }
        },
        capacity: event.capacity || 50,
        price: event.price || 0,
        currency: event.currency || 'NZD',
        images: event.images || [],
        tags: event.tags || [],
        requirements: event.requirements || [],
        contactInfo: {
          name: event.contactInfo?.name || '',
          email: event.contactInfo?.email || '',
          phone: event.contactInfo?.phone || ''
        }
      });
      setIsLoading(false);
    }
  }, [eventData]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        const parentObject = parentValue && typeof parentValue === 'object' && parentValue !== null 
          ? parentValue as Record<string, any>
          : {};
        
        return {
          ...prev,
          [parent]: {
            ...parentObject,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format dates to include timezone information for backend validation
      const eventData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : formData.startDate,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : formData.endDate,
      };

      await updateEventMutation.mutateAsync({
        id: eventId,
        data: eventData
      });
      toast.success('Event updated successfully');
      router.push('/admin/events');
    } catch (error) {
      toast.error('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveEventMutation.mutateAsync(eventId);
      toast.success('Event approved successfully');
      router.push('/admin/events');
    } catch (error) {
      toast.error('Failed to approve event. Please try again.');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectEventMutation.mutateAsync({ id: eventId, reason });
      toast.success('Event rejected successfully');
      router.push('/admin/events');
    } catch (error) {
      toast.error('Failed to reject event. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: AlertCircle },
      pending_approval: { variant: 'outline' as const, label: 'Pending Approval', icon: Calendar },
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

  if (eventLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (eventError || !eventData?.data?.event) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Event not found</h3>
          <p className="text-muted-foreground text-center mb-6">
            The event you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Button onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const event = eventData.data.event;
  const categories = categoriesData?.data?.categories || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/events')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
              <p className="text-muted-foreground mt-1">
                Admin editing: {event.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(event.status)}
            {(event.status === 'draft' || event.status === 'pending_approval') && (
              <>
                <ConfirmationDialog
                  trigger={
                    <Button
                      variant="destructive"
                      disabled={rejectEventMutation.isPending}
                    >
                      {rejectEventMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
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
                      handleReject(reason);
                    }
                  }}
                  confirmText="Reject"
                  cancelText="Cancel"
                />
                <ConfirmationDialog
                  trigger={
                    <Button
                      disabled={approveEventMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {approveEventMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  }
                  title="Approve Event"
                  description={`Are you sure you want to approve "${event.title}"? This will make the event visible to all users.`}
                  variant="success"
                  onConfirm={handleApprove}
                  confirmText="Approve"
                  cancelText="Cancel"
                />
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details of the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationName">Venue Name *</Label>
                  <Input
                    id="locationName"
                    value={formData.location.name}
                    onChange={(e) => handleInputChange('location.name', e.target.value)}
                    placeholder="Enter venue name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationCity">City *</Label>
                  <Input
                    id="locationCity"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationAddress">Address</Label>
                <Input
                  id="locationAddress"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NZD">NZD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactInfo.name}
                    onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                    placeholder="Enter contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                />
                <Button type="button" onClick={handleAddRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.requirements.length > 0 && (
                <ul className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{requirement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRequirement(requirement)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/events')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateEventMutation.isPending}
            >
              {isSubmitting || updateEventMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
