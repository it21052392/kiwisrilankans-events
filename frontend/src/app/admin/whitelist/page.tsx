'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Search, 
  Plus, 
  Trash2, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { useAdminWhitelist, useAddToWhitelist, useRemoveFromWhitelist } from '@/hooks/queries/useAdminWhitelist';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminWhitelistPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');

  // Fetch whitelist
  const { data: whitelistData, isLoading: whitelistLoading, refetch } = useAdminWhitelist();

  // Mutations
  const addToWhitelistMutation = useAddToWhitelist();
  const removeFromWhitelistMutation = useRemoveFromWhitelist();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const whitelistEntries = whitelistData?.data?.emails || [];

  // Filter whitelist based on search
  const filteredWhitelist = whitelistEntries.filter(entry => 
    !searchTerm || 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.addedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddToWhitelist = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!validateEmail(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await addToWhitelistMutation.mutateAsync({ email: newEmail });
      toast.success('Email added to whitelist successfully');
      setIsAddModalOpen(false);
      setNewEmail('');
      refetch();
    } catch (error) {
      console.error('Error adding email to whitelist:', error);
      toast.error('Failed to add email to whitelist. Please try again.');
    }
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the whitelist?`)) {
      return;
    }

    setIsDeleting(email);
    try {
      await removeFromWhitelistMutation.mutateAsync(email);
      toast.success('Email removed from whitelist successfully');
      refetch();
    } catch (error) {
      console.error('Error removing email from whitelist:', error);
      toast.error('Failed to remove email from whitelist. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'} className="flex items-center gap-1">
        {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Whitelist</h1>
            <p className="text-muted-foreground mt-1">
              Manage who can access the system via Google OAuth
            </p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Email to Whitelist</DialogTitle>
                <DialogDescription>
                  Add an email address to allow access to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddToWhitelist}
                    disabled={addToWhitelistMutation.isPending}
                  >
                    {addToWhitelistMutation.isPending ? 'Adding...' : 'Add Email'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search whitelist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Whitelist List */}
        {whitelistLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredWhitelist.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No whitelist entries found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm
                  ? 'No entries match your search. Try adjusting your search criteria.'
                  : "No emails have been whitelisted yet. Add your first email to get started!"
                }
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Email
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredWhitelist.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{entry.email}</CardTitle>
                          {getStatusBadge(entry.isActive)}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Added by {entry.addedBy?.name || 'Unknown'}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWhitelist(entry.email)}
                        disabled={isDeleting === entry.email}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isDeleting === entry.email ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Added {format(new Date(entry.addedAt), 'MMM do, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Status: {entry.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Email: {entry.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Added by: {entry.addedBy?.name || 'Unknown'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {whitelistEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Whitelist Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{whitelistEntries.length}</div>
                  <div className="text-sm text-muted-foreground">Total Emails</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {whitelistEntries.filter(e => e.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {whitelistEntries.filter(e => !e.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {whitelistEntries.filter(e => e.addedBy?.name === user?.name).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Added by You</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              How Whitelist Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Only whitelisted email addresses can access the system via Google OAuth</p>
              <p>• Users must be added to the whitelist before they can log in</p>
              <p>• When a user tries to log in, the system checks if their email is whitelisted</p>
              <p>• If the email is not whitelisted, access will be denied</p>
              <p>• You can remove emails from the whitelist to revoke access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
