'use client';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuthStore();
  
  // Redirect to login if not authenticated
  useAuthRedirect();

  if (!user) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground text-lg">
              View and manage your account information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Overview - Enhanced */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {user.role === 'admin' ? 'Administrator' : 'Organizer'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Member Since</p>
                        <p className="text-muted-foreground">
                          {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Account Status</p>
                        <p className="text-green-600 dark:text-green-400">Active</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information - Read-only Display */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="w-6 h-6" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your personal account details
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <div className="p-3 bg-muted/30 rounded-md border">
                          <p className="text-base font-medium">{user.name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                        <div className="p-3 bg-muted/30 rounded-md border">
                          <p className="text-base font-medium">{user.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Avatar URL</Label>
                        <div className="p-3 bg-muted/30 rounded-md border">
                          <p className="text-base font-medium break-all">
                            {user.avatar || 'No avatar URL provided'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Profile picture URL
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

