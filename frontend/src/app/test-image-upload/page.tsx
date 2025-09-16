'use client';

import { useState } from 'react';
import { EventImageUpload } from '@/components/events/EventImageUpload';
import { EventImageGallery } from '@/components/events/EventImageGallery';
import { ImageUploadResult } from '@/services/image-upload.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestImageUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleImagesChange = (images: ImageUploadResult[]) => {
    setUploadedImages(images);
    console.log('Images updated:', images);
  };

  const handleUploadStart = () => {
    console.log('Upload started');
  };

  const handleUploadComplete = (images: ImageUploadResult[]) => {
    console.log('Upload completed:', images);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Upload Test Page
          </h1>
          <p className="text-gray-600">
            Test the image upload functionality and components
          </p>
        </div>

        {/* Upload Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Event Image Upload Component</CardTitle>
            <CardDescription>
              Test the EventImageUpload component with drag-drop functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventImageUpload
              images={uploadedImages}
              onImagesChange={handleImagesChange}
              maxImages={5}
              disabled={false}
              showGuidelines={true}
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </CardContent>
        </Card>

        {/* Gallery Component Test */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Image Gallery Component</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGallery(!showGallery)}
                  >
                    {showGallery ? 'Hide Gallery' : 'Show Gallery'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Test the EventImageGallery component with uploaded images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showGallery && (
                <EventImageGallery
                  images={uploadedImages}
                  showPrimaryBadge={true}
                  allowFullscreen={true}
                  aspectRatio="video"
                  onImageClick={(image, index) => {
                    console.log('Image clicked:', image, index);
                  }}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Current state and uploaded images data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Uploaded Images Count:</h4>
                <p className="text-2xl font-bold text-primary">{uploadedImages.length}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Total Size:</h4>
                <p className="text-lg">
                  {Math.round(uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024 * 100) / 100} MB
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Images Data:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
                  {JSON.stringify(uploadedImages, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>
              How to test the image upload functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <p className="font-medium">Drag and Drop Test</p>
                  <p className="text-sm text-gray-600">Try dragging image files from your computer onto the upload area</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <p className="font-medium">Click to Upload</p>
                  <p className="text-sm text-gray-600">Click the upload area to open file selection dialog</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <p className="font-medium">Image Management</p>
                  <p className="text-sm text-gray-600">Test removing images, setting primary image, and reordering</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <div>
                  <p className="font-medium">Gallery View</p>
                  <p className="text-sm text-gray-600">Click "Show Gallery" to test the image gallery component</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">5</div>
                <div>
                  <p className="font-medium">Console Logs</p>
                  <p className="text-sm text-gray-600">Check browser console for detailed upload logs and debugging info</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
