'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    // Add a small delay to prevent rapid redirects
    const timeoutId = setTimeout(() => {
      // Don't redirect while loading
      if (isLoading) {
        console.log('Auth redirect: Skipping redirect - still loading');
        return;
      }

      console.log('Auth redirect check:', { isAuthenticated, user: user?.role, pathname, isLoading });
      
      // Don't redirect if we're already on a login page
      if (pathname === '/auth/login' || pathname === '/admin/login') return;

      // Public routes that don't require authentication
      const publicRoutes = ['/auth/login', '/auth/callback', '/admin/login', '/', '/events', '/categories', '/events/calendar'];
      const isPublicRoute = publicRoutes.some(route => {
        if (route.includes('[') && route.includes(']')) {
          // Handle dynamic routes
          const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
          const regex = new RegExp(`^${routePattern}$`);
          return regex.test(pathname);
        }
        return pathname === route;
      });

      // Check for dynamic event routes
      const isEventDetailRoute = /^\/events\/[^\/]+$/.test(pathname);
      const isPublicEventRoute = isEventDetailRoute;

      // If user is not authenticated and trying to access protected route
      if (!isAuthenticated && !isPublicRoute && !isPublicEventRoute) {
        console.log('Redirecting to login: not authenticated and accessing protected route');
        router.push('/auth/login');
        return;
      }

      // If user is authenticated and on login page, redirect to appropriate dashboard
      if (isAuthenticated && (pathname === '/auth/login' || pathname === '/admin/login')) {
        console.log('Redirecting from login to dashboard');
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/organizer/dashboard');
        }
        return;
      }

      // If user is authenticated but trying to access wrong dashboard
      if (isAuthenticated && user) {
        const isAdminRoute = pathname.startsWith('/admin');
        const isOrganizerRoute = pathname.startsWith('/organizer');
        
        if (isAdminRoute && user.role !== 'admin') {
          console.log('Redirecting admin route to organizer dashboard');
          router.push('/organizer/dashboard');
          return;
        }
        
        if (isOrganizerRoute && user.role !== 'organizer') {
          console.log('Redirecting organizer route to admin dashboard');
          router.push('/admin/dashboard');
          return;
        }
      }
    }, 100); // Small delay to prevent rapid redirects

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isLoading, pathname]); // Removed router from dependencies
}