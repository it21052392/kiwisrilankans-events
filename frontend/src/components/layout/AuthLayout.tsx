'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-secondary/10 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Calendar className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold">Kiwi Sri Lankans Events</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Welcome to our community
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow Sri Lankans in New Zealand through meaningful events, 
            cultural celebrations, and community gatherings.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center space-x-2 mb-8 lg:hidden">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Kiwi Sri Lankans Events</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>

          {children}

          {/* Back to home */}
          <div className="text-center mt-8">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
