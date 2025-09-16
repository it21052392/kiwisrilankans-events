'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  User,
  Home,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'organizer' | 'admin';
}

const organizerNavItems = [
  { href: '/organizer/dashboard', label: 'Dashboard', icon: Home },
  { href: '/organizer/events', label: 'My Events', icon: Calendar },
  { href: '/organizer/events/create', label: 'Create Event', icon: Plus },
  { href: '/organizer/pencil-holds', label: 'Pencil Holds', icon: FileText },
];

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/events', label: 'All Events', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Settings },
  { href: '/admin/whitelist', label: 'Whitelist', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = userRole === 'admin' ? adminNavItems : organizerNavItems;

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logosnew.png"
              alt="Kiwi Sri Lankans Events"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/images/Logosnew.png"
                      alt="Kiwi Sri Lankans Events"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                    />
                  </Link>
                </div>

                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-card border-r">
            <div className="flex items-center h-16 px-4 border-b">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/Logosnew.png"
                  alt="Kiwi Sri Lankans Events"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-4">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
