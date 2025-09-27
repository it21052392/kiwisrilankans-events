'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { useUpdateProfile } from '@/hooks/queries/useUsers';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Save,
  Edit3,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  // Redirect to login if not authenticated
  useAuthRedirect();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateProfileMutation.mutateAsync(data);
      
      if (response.success) {
        // Update the user in the auth store
        setUser({
          id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          avatar: response.data.user.avatar,
          createdAt: response.data.user.createdAt,
        });
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
        
        setIsEditing(false);
        reset(data);
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

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
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="w-6 h-6" />
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-base">
                        Your personal account details
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="shrink-0"
                    >
                      {isEditing ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Done
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          disabled={!isEditing}
                          className={`text-base ${errors.name ? 'border-red-500' : ''} ${!isEditing ? 'bg-muted/50' : ''}`}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted/50 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar" className="text-sm font-medium">Avatar URL</Label>
                        <Input
                          id="avatar"
                          {...register('avatar')}
                          disabled={!isEditing}
                          placeholder="https://example.com/avatar.jpg"
                          className={`text-base ${errors.avatar ? 'border-red-500' : ''} ${!isEditing ? 'bg-muted/50' : ''}`}
                        />
                        {errors.avatar && (
                          <p className="text-sm text-red-500">{errors.avatar.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enter a valid image URL for your profile picture
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending || !isDirty}
                          className="flex-1"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <LoadingSpinner className="w-4 h-4 mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

