'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, refreshToken, isLoading, isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        await checkAuth();
      } catch (error) {
        // If checkAuth fails, try to refresh token
        try {
          await refreshToken();
        } catch (refreshError) {
          // If both fail, user is not authenticated
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children and redirect hook after initialization
  return (
    <>
      <AuthRedirectHandler />
      {children}
    </>
  );
}

// Separate component for handling redirects after initialization
function AuthRedirectHandler() {
  useAuthRedirect();
  return null;
}
