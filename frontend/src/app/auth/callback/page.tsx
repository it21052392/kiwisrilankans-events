'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) return;
    
    const handleCallback = async () => {
      try {
        setHasProcessed(true);
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        // Check for error first
        if (error) {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          toast.error('Authentication failed. Please try again.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Check if we have the required parameters
        if (!token || !role) {
          setStatus('error');
          setMessage('Missing authentication parameters. Please try again.');
          toast.error('Missing authentication parameters. Please try again.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Validate role
        if (!['organizer', 'admin'].includes(role)) {
          setStatus('error');
          setMessage('Invalid user role. Please try again.');
          toast.error('Invalid user role. Please try again.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Get user information from the token
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to get user information');
          }

          const userData = await response.json();
          
          if (!userData.success) {
            throw new Error('Failed to get user information');
          }

          // Login the user
          login(userData.data.user, token);
          
          setStatus('success');
          setMessage(`Welcome back! Redirecting to your ${role} dashboard...`);
          // Show toast notification using custom toast system
          toast({
            title: 'Welcome back!',
            description: `Redirecting to your ${role} dashboard...`,
          });

          // Redirect to appropriate dashboard
          setTimeout(() => {
            if (role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/organizer/dashboard');
            }
          }, 2000);

        } catch (error) {
          console.error('Error getting user information:', error);
          setStatus('error');
          setMessage('Failed to complete authentication. Please try again.');
          toast.error('Failed to complete authentication. Please try again.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, hasProcessed]); // Removed router from dependencies

  return (
    <AuthLayout 
      title="Authentication" 
      subtitle="Please wait while we complete your login"
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground text-center">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-600 text-center font-medium">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-center font-medium">{message}</p>
            <p className="text-muted-foreground text-center text-sm">
              You will be redirected to the login page shortly.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
