'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';
import { Shield, Lock } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Add a small delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to Google OAuth endpoint for admin
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/admin`;
      window.location.href = googleAuthUrl;
      
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initiate Google login. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Admin Branding with Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/login_background.jpg"
            alt="Admin Background"
            fill
            className="object-cover"
            priority
          />
          {/* Darker overlay for admin section */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/images/Logosnew.png"
                alt="Kiwi Sri Lankans Events"
                width={200}
                height={80}
                className="mx-auto h-16 w-auto"
                priority
              />
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-white mr-4" />
              <h1 className="text-4xl font-bold text-white">
                Admin Portal
              </h1>
            </div>
            
            <p className="text-white/90 text-lg leading-relaxed mb-6">
              Manage users, approve events, and oversee the platform
            </p>
            
            <div className="flex items-center justify-center text-white/70">
              <Lock className="h-4 w-4 mr-2" />
              <span className="text-sm">Restricted Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Admin Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <Image
              src="/images/Logosnew.png"
              alt="Kiwi Sri Lankans Events"
              width={150}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Sign In</h1>
            <p className="text-slate-300 text-lg">Access the administrative dashboard</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Administrator Access</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in with your admin Google account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Login */}
              <div className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-4 border-slate-600 text-slate-300">
                    <Shield className="h-4 w-4 mr-2" />
                    Administrator
                  </Badge>
                </div>
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  size="lg"
                >
                  {isGoogleLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Shield className="mr-2 h-5 w-5" />
                  )}
                  Sign in as Admin
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Manage users, approve events, and oversee the platform
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to home */}
          <div className="text-center mt-8">
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:underline"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
