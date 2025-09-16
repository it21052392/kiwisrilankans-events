'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Menu, X, Users, Settings, LogOut, User } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logosnew.png"
              alt="Kiwi Sri Lankans Events"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Events
            </Link>
            <Link
              href="/events/calendar"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Calendar
            </Link>
            <Link
              href="/categories"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Categories
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="default">
                      <Settings className="h-5 w-5 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                {user?.role === 'organizer' && (
                  <Link href="/organizer/dashboard">
                    <Button variant="outline" size="default">
                      <Users className="h-5 w-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="default">
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Button>
                </Link>
                <ConfirmationDialog
                  trigger={
                    <Button variant="ghost" size="default">
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  }
                  title="Logout"
                  description="Are you sure you want to logout? You will need to sign in again to access your account."
                  variant="warning"
                  onConfirm={handleLogout}
                  confirmText="Logout"
                  cancelText="Cancel"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="default">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="default">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link
                    href="/events"
                    className="text-base font-medium hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/events/calendar"
                    className="text-base font-medium hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/categories"
                    className="text-base font-medium hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Categories
                  </Link>
                  
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      {user?.role === 'admin' && (
                        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-5 w-5 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      {user?.role === 'organizer' && (
                        <Link href="/organizer/dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="h-5 w-5 mr-2" />
                            Organizer Dashboard
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-5 w-5 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <ConfirmationDialog
                        trigger={
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-600 hover:text-red-700"
                          >
                            <LogOut className="h-5 w-5 mr-2" />
                            Logout
                          </Button>
                        }
                        title="Logout"
                        description="Are you sure you want to logout? You will need to sign in again to access your account."
                        variant="warning"
                        onConfirm={handleLogout}
                        confirmText="Logout"
                        cancelText="Cancel"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
