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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  Bell, 
  Eye, 
  Save,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']),
      showEmail: z.boolean(),
    }),
  }),
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
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
      preferences: {
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          push: user?.preferences?.notifications?.push ?? true,
          sms: user?.preferences?.notifications?.sms ?? false,
        },
        privacy: {
          profileVisibility: user?.preferences?.privacy?.profileVisibility ?? 'public',
          showEmail: user?.preferences?.privacy?.showEmail ?? false,
        },
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateProfileMutation.mutateAsync(data);
      
      if (response.success) {
        // Update the user in the auth store
        setUser(response.data.user);
        
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Shield className="w-4 h-4" />
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrator' : 'Organizer'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Basic Information
                        </CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
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
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          disabled={!isEditing}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        {...register('avatar')}
                        disabled={!isEditing}
                        placeholder="https://example.com/avatar.jpg"
                        className={errors.avatar ? 'border-red-500' : ''}
                      />
                      {errors.avatar && (
                        <p className="text-sm text-red-500">{errors.avatar.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={watch('preferences.notifications.email')}
                        onCheckedChange={(checked) =>
                          setValue('preferences.notifications.email', checked, { shouldDirty: true })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={watch('preferences.notifications.push')}
                        onCheckedChange={(checked) =>
                          setValue('preferences.notifications.push', checked, { shouldDirty: true })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={watch('preferences.notifications.sms')}
                        onCheckedChange={(checked) =>
                          setValue('preferences.notifications.sms', checked, { shouldDirty: true })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Privacy Settings
                    </CardTitle>
                    <CardDescription>
                      Control your privacy and visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select
                        value={watch('preferences.privacy.profileVisibility')}
                        onValueChange={(value: 'public' | 'private' | 'friends') =>
                          setValue('preferences.privacy.profileVisibility', value, { shouldDirty: true })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your email address
                        </p>
                      </div>
                      <Switch
                        checked={watch('preferences.privacy.showEmail')}
                        onCheckedChange={(checked) =>
                          setValue('preferences.privacy.showEmail', checked, { shouldDirty: true })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending || !isDirty}
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
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
