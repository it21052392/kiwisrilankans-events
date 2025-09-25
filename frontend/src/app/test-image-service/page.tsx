'use client';

import { useState } from 'react';
import { ImageUploadService } from '@/services/image-upload.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestImageServicePage() {
  const [testResults, setTestResults] = useState<{
    fileValidation: boolean | null;
    imageOptimization: boolean | null;
    serviceAvailable: boolean | null;
    error: string | null;
  }>({
    fileValidation: null,
    imageOptimization: null,
    serviceAvailable: null,
    error: null
  });

  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults({
      fileValidation: null,
      imageOptimization: null,
      serviceAvailable: null,
      error: null
    });

    try {
      // Test 1: File Validation
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const validation = await ImageUploadService.validateImage(testFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      
      setTestResults(prev => ({
        ...prev,
        fileValidation: validation.isValid
      }));

      // Test 2: Image Optimization
      try {
        const optimizedFile = await ImageUploadService.optimizeImage(testFile, {
          maxWidth: 2000,
          maxHeight: 2000,
          quality: 0.8
        });
        setTestResults(prev => ({
          ...prev,
          imageOptimization: optimizedFile instanceof File
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          imageOptimization: false
        }));
      }

      // Test 3: Service Methods
      const isImageFile = ImageUploadService.isImageFile(testFile);
      const fileExtension = ImageUploadService.getFileExtension('test.jpg');
      const formattedSize = ImageUploadService.formatFileSize(1024 * 1024);
      
      setTestResults(prev => ({
        ...prev,
        serviceAvailable: isImageFile && fileExtension === 'jpg' && formattedSize === '1 MB'
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const TestResult = ({ 
    test, 
    result, 
    label 
  }: { 
    test: string; 
    result: boolean | null; 
    label: string; 
  }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {result === null ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : result ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">{test}</p>
      </div>
      {result !== null && (
        <Badge variant={result ? "default" : "destructive"}>
          {result ? "Pass" : "Fail"}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Service Test Page
          </h1>
          <p className="text-gray-600">
            Test the ImageUploadService functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Tests</CardTitle>
            <CardDescription>
              Run tests to verify the ImageUploadService is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>

            <div className="space-y-3">
              <TestResult
                test="File validation with proper MIME type and size limits"
                result={testResults.fileValidation}
                label="File Validation"
              />
              
              <TestResult
                test="Image optimization and resizing functionality"
                result={testResults.imageOptimization}
                label="Image Optimization"
              />
              
              <TestResult
                test="Service utility methods and helper functions"
                result={testResults.serviceAvailable}
                label="Service Methods"
              />
            </div>

            {testResults.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Error:</strong> {testResults.error}
                </AlertDescription>
              </Alert>
            )}

            {testResults.fileValidation && testResults.imageOptimization && testResults.serviceAvailable && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>All tests passed!</strong> The ImageUploadService is working correctly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>
              Details about the ImageUploadService capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Supported File Types</h4>
                <div className="flex flex-wrap gap-1">
                  {['JPEG', 'PNG', 'WebP', 'GIF'].map(type => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Default Limits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Max Size: 5MB</li>
                  <li>Max Width: 4000px</li>
                  <li>Max Height: 4000px</li>
                  <li>Quality: 80%</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ File validation</li>
                  <li>✅ Image optimization</li>
                  <li>✅ Size formatting</li>
                  <li>✅ Type checking</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Upload Types</h4>
                <div className="flex flex-wrap gap-1">
                  {['event_image', 'avatar', 'banner', 'general'].map(type => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
