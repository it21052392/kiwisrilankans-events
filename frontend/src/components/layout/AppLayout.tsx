'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Toaster as CustomToaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary, AuthErrorFallback } from '@/components/ErrorBoundary';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary fallback={AuthErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                zIndex: 9999,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
          <CustomToaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
