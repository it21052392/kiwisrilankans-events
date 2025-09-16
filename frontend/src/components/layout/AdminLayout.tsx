'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout userRole="admin">
      {children}
    </DashboardLayout>
  );
}
