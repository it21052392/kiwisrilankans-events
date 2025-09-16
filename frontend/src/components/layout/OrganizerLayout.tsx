'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';

interface OrganizerLayoutProps {
  children: ReactNode;
}

export function OrganizerLayout({ children }: OrganizerLayoutProps) {
  return (
    <DashboardLayout userRole="organizer">
      {children}
    </DashboardLayout>
  );
}
