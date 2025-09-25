'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Add a small delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to Google OAuth endpoint for organizer
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/organizer`;
      window.location.href = googleAuthUrl;
      
    } catch (error) {
      toast.error('Failed to initiate Google login. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };


  if (isLoading) {
    return (
      <AuthLayout title="Logging in..." subtitle="Please wait while we authenticate you">
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to manage events and connect with the community"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Sign in with Google to manage your events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organizer Login */}
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                Event Organizer
              </Badge>
            </div>
            <Button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full"
              size="lg"
            >
              {isGoogleLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Calendar className="mr-2 h-5 w-5" />
              )}
              Sign in as Organizer
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Create and manage your events
            </p>
          </div>



        </CardContent>
      </Card>

    </AuthLayout>
  );
}
