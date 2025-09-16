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
import { Calendar, Users, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async (role: 'organizer' | 'admin') => {
    try {
      setIsGoogleLoading(true);
      
      // Redirect to Google OAuth endpoint
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/${role}`;
      window.location.href = googleAuthUrl;
      
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initiate Google login. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDemoLogin = (role: 'organizer' | 'admin') => {
    // Demo login for development
    const demoUser = {
      id: 'demo-user-id',
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `demo.${role}@example.com`,
      role,
      avatar: undefined,
      createdAt: new Date().toISOString(),
    };
    
    const demoToken = 'demo-jwt-token';
    
    login(demoUser, demoToken);
    toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    
    // Redirect to appropriate dashboard
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/organizer/dashboard');
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
            Choose your role and sign in with Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organizer Login */}
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                <Users className="h-4 w-4 mr-2" />
                Event Organizer
              </Badge>
            </div>
            <Button
              onClick={() => handleGoogleLogin('organizer')}
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

          <Separator />

          {/* Admin Login */}
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Administrator
              </Badge>
            </div>
            <Button
              onClick={() => handleGoogleLogin('admin')}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isGoogleLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Shield className="mr-2 h-5 w-5" />
              )}
              Sign in as Admin
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Manage users, approve events, and oversee the platform
            </p>
          </div>

          {/* Demo Login (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-4">
                    Development Mode
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleDemoLogin('organizer')}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    Demo Organizer
                  </Button>
                  <Button
                    onClick={() => handleDemoLogin('admin')}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    Demo Admin
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Quick demo access for development
                </p>
              </div>
            </>
          )}

          {/* Help Text */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <span className="text-primary font-medium">
                Contact an administrator to get whitelisted
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Event Management</h3>
          <p className="text-sm text-muted-foreground">
            Create, manage, and track your events with ease
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="font-semibold mb-2">Community Building</h3>
          <p className="text-sm text-muted-foreground">
            Connect with the Sri Lankan community in New Zealand
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
