'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
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
  Send,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCreatePencilHold } from '@/hooks/queries/usePencilHolds';
import { eventsService, CreateEventData } from '@/services/events.service';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createPencilHold, setCreatePencilHold] = useState(false);
  const [pencilHoldNotes, setPencilHoldNotes] = useState('');
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Pencil hold mutation
  const createPencilHoldMutation = useCreatePencilHold();

  // Form state
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
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
    images: [],
    tags: [],
    requirements: [],
    contactInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: ''
    }
  });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'organizer') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.location.name.trim()) {
      newErrors.locationName = 'Venue name is required';
    }

    if (!formData.location.address.trim()) {
      newErrors.locationAddress = 'Venue address is required';
    }

    if (!formData.location.city.trim()) {
      newErrors.locationCity = 'City is required';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (!formData.contactInfo.name.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.contactInfo.email.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`location${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`location${field.charAt(0).toUpperCase() + field.slice(1)}`]: ''
      }));
    }
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Update form data with image URL (for now, we'll use a placeholder)
      // In a real app, you'd upload to a service and get the actual URL
      setFormData(prev => ({
        ...prev,
        images: [{
          url: previewUrl, // This will be replaced with actual uploaded URL
          alt: file.name,
          isPrimary: true
        }]
      }));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      images: []
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format dates to include timezone information for backend validation
      const eventData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : formData.startDate,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : formData.endDate,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : formData.registrationDeadline,
      };

      const response = await eventsService.createEvent(eventData);
      
      if (response.success) {
        const eventId = response.data.event._id;
        
        // Create pencil hold if requested
        if (createPencilHold && pencilHoldNotes.trim()) {
          try {
            await createPencilHoldMutation.mutateAsync({
              eventId,
              notes: pencilHoldNotes,
              priority: 5,
            });
            toast.success('Event created and pencil hold created successfully!');
          } catch (pencilHoldError) {
            console.error('Error creating pencil hold:', pencilHoldError);
            toast.error('Event created but failed to create pencil hold');
          }
        } else {
          toast.success('Event created successfully!');
        }
        
        router.push('/organizer/events');
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </OrganizerLayout>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'organizer') {
    return null;
  }

  const categories = categoriesData?.data?.categories || [];

  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details below to create your event
            </p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about your event
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
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event in detail"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Event Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Image
              </CardTitle>
              <CardDescription>
                Upload a cover image for your event (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Selected:</span> {selectedImage?.name}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
              <CardDescription>
                When will your event take place?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
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
              <CardDescription>
                Where will your event be held?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name *</Label>
                  <Input
                    id="venueName"
                    value={formData.location.name}
                    onChange={(e) => handleLocationChange('name', e.target.value)}
                    placeholder="e.g., Auckland Town Hall"
                    className={errors.locationName ? 'border-red-500' : ''}
                  />
                  {errors.locationName && <p className="text-sm text-red-500">{errors.locationName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    placeholder="e.g., 303 Queen Street"
                    className={errors.locationAddress ? 'border-red-500' : ''}
                  />
                  {errors.locationAddress && <p className="text-sm text-red-500">{errors.locationAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    placeholder="e.g., Auckland"
                    className={errors.locationCity ? 'border-red-500' : ''}
                  />
                  {errors.locationCity && <p className="text-sm text-red-500">{errors.locationCity}</p>}
                </div>
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
              <CardDescription>
                Set the capacity and pricing for your event
              </CardDescription>
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
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                    className={errors.capacity ? 'border-red-500' : ''}
                  />
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (NZD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
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
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
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
              <CardDescription>
                Add tags to help people find your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
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
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Requirements
              </CardTitle>
              <CardDescription>
                What do attendees need to bring or know?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm">• {requirement}</span>
                      <X
                        className="h-3 w-3 cursor-pointer text-muted-foreground"
                        onClick={() => removeRequirement(requirement)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How can people contact you about this event?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactInfo.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && <p className="text-sm text-red-500">{errors.contactName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="e.g., +64 21 123 4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pencil Hold Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pencil Hold (Optional)
              </CardTitle>
              <CardDescription>
                Reserve this event slot for 48 hours while you finalize details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createPencilHold"
                  checked={createPencilHold}
                  onChange={(e) => setCreatePencilHold(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="createPencilHold" className="text-sm font-medium">
                  Create pencil hold for this event
                </Label>
              </div>
              
              {createPencilHold && (
                <div className="space-y-2">
                  <Label htmlFor="pencilHoldNotes">Pencil Hold Notes</Label>
                  <Textarea
                    id="pencilHoldNotes"
                    value={pencilHoldNotes}
                    onChange={(e) => setPencilHoldNotes(e.target.value)}
                    placeholder="Add notes about this pencil hold (e.g., need to confirm speakers, finalize venue details...)"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will reserve the event slot for 48 hours. You can confirm or cancel it later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/organizer/events')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
