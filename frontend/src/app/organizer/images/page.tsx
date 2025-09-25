'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Upload, 
  Grid, 
  List, 
  Calendar,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ImageUploadService, ImageUploadResult } from '@/services/image-upload.service';
import { EventImageGallery } from '@/components/events/EventImageGallery';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ImageManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ImageUploadResult[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageUploadResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'organizer') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user]); // Removed router from dependencies

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, selectedType]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const response = await ImageUploadService.getUserImages('event_image', 1, 100);
      if (response.success) {
        setImages(response.data.files);
      }
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = images;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(img => img.uploadType === selectedType);
    }

    setFilteredImages(filtered);
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadResults = await ImageUploadService.uploadImages(files, 'event_image');
      setImages(prev => [...prev, ...uploadResults]);
      toast.success(`${uploadResults.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await ImageUploadService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    try {
      setIsDeleting(true);
      const deletePromises = Array.from(selectedImages).map(id => 
        ImageUploadService.deleteImage(id)
      );
      await Promise.all(deletePromises);
      
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
      setSelectedImages(new Set());
      toast.success(`${selectedImages.size} image(s) deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete images');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user || user.role !== 'organizer') {
    return <div>Loading...</div>;
  }

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your event images and upload new ones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </Button>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleImageUpload(files);
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="event_image">Event Images</option>
                  <option value="banner">Banners</option>
                  <option value="avatar">Avatars</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Display */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredImages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first event image to get started'
                }
              </p>
              {!searchTerm && selectedType === 'all' && (
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <EventImageGallery
            images={filteredImages}
            showPrimaryBadge={false}
            allowFullscreen={true}
            aspectRatio="square"
            onImageClick={(image, index) => {
              // Handle image click for management actions
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => handleImageSelect(image.id)}
                        className="absolute top-2 left-2 z-10"
                      />
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {image.originalName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(image.size)}</span>
                        <span>{image.type}</span>
                        <span>{formatDate(image.uploadedAt)}</span>
                        {image.dimensions && (
                          <span>{image.dimensions.width} × {image.dimensions.height}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {image.uploadType}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = image.url;
                          link.download = image.originalName;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{images.length}</div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {images.filter(img => img.uploadType === 'event_image').length}
                </div>
                <div className="text-sm text-gray-600">Event Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(images.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024 * 100) / 100} MB
                </div>
                <div className="text-sm text-gray-600">Total Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {images.length > 0 ? Math.round(images.reduce((sum, img) => sum + img.size, 0) / images.length / 1024) : 0} KB
                </div>
                <div className="text-sm text-gray-600">Avg Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizerLayout>
  );
}
