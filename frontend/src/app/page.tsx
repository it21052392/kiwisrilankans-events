'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/events/EventCard';
import { CalendarWidget } from '@/components/calendar/CalendarWidget';
import { useEvents } from '@/hooks/queries/useEvents';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCommunityStats } from '@/hooks/queries/useCommunityStats';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  ArrowRight,
  Heart,
  Globe,
  Music,
  Utensils,
  BookOpen,
  Gamepad2,
  Briefcase,
  Home as HomeIcon
} from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons: Record<string, any> = {
  'cultural': Heart,
  'food': Utensils,
  'music': Music,
  'sports': Gamepad2,
  'networking': Globe,
  'education': BookOpen,
  'business': Briefcase,
  'home': HomeIcon,
  'default': Calendar,
};

export default function Home() {
  // Fetch latest events (limit to 6 for featured section)
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents({ 
    limit: 6, 
    sortBy: 'startDate', 
    sortOrder: 'asc',
    hidePast: true 
  } as any);
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories({ 
    limit: 6,
    active: true 
  });

  const events = eventsData?.data?.events || [];
  const categories = categoriesData?.data?.categories || [];
  
  // Fetch community stats
  const { data: statsData, isLoading: statsLoading } = useCommunityStats();
  const stats = statsData?.data;
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background_image.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connect with the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Sri Lankan Community
              </span>{' '}
              in New Zealand
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover, create, and join meaningful events that celebrate our culture, 
              build connections, and strengthen our community bonds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events/calendar">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white bg-transparent hover:bg-white/20 hover:text-white">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background_image.png"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {statsLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.events?.published || 0}+
                </div>
                <div className="text-white/80">Events Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.users?.total || 0}+
                </div>
                <div className="text-white/80">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.users?.organizers || 0}+
                </div>
                <div className="text-white/80">Event Organizers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.categories?.active || 0}
                </div>
                <div className="text-white/80">Categories</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-slate-200/30 to-slate-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-slate-300/20 to-slate-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 text-sm font-medium mb-6 shadow-sm border border-slate-200">
              <Star className="h-4 w-4" />
              Featured Events
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Discover Amazing Events
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover the most popular and upcoming events in our community. 
              From cultural celebrations to networking opportunities, find your perfect event.
            </p>
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : eventsError ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="Error Loading Events"
              description="There was an error loading the events. Please try again later."
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="No Upcoming Events"
              description="There are no upcoming events at the moment. Check back later for new events!"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {events.map((event, index) => (
                  <div 
                    key={event._id}
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-slate-300/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative">
                      <EventCard
                        event={event}
                        variant="featured"
                        showActions={false}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/events">
                  <Button 
                    size="lg" 
                    className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    View All Events
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Calendar Widget */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-slate-200/30 to-slate-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-slate-300/20 to-slate-200/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 text-sm font-medium mb-6 shadow-sm border border-slate-200">
              <Calendar className="h-4 w-4" />
              Event Calendar
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Stay Updated with{' '}
              <span className="text-slate-600">
                Upcoming Events
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Never miss an important event. Browse our interactive calendar and plan your participation in community activities.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
              <CalendarWidget 
                showTitle={false}
                showNavigation={true}
                maxEvents={4}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-slate-200/30 to-slate-300/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tl from-slate-300/20 to-slate-200/30 rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 text-sm font-medium mb-6 shadow-sm border border-slate-200">
              <Heart className="h-4 w-4" />
              Event Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Find Your Perfect Event
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Find events that match your interests and passions. From cultural celebrations to professional networking, 
              discover events tailored to your lifestyle.
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : categoriesError ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="Error Loading Categories"
              description="There was an error loading the categories. Please try again later."
            />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="No Categories Available"
              description="There are no event categories available at the moment."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                {categories.map((category, index) => {
                  const IconComponent = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
                  return (
                    <Link 
                      key={category._id} 
                      href={`/events?category=${category._id}`}
                      className="group block"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-full">
                        {/* Hover glow effect */}
                        <div 
                          className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                          style={{ 
                            background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
                            transform: 'scale(1.1)'
                          }}
                        />
                        
                        {/* Card */}
                        <Card className="group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 cursor-pointer h-full border-0 bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-8 text-center h-full flex flex-col justify-center relative">
                            {/* Background pattern */}
                            <div 
                              className="absolute inset-0 rounded-2xl opacity-5"
                              style={{ backgroundColor: category.color }}
                            />
                            
                            <div 
                              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg"
                              style={{ 
                                background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                                border: `2px solid ${category.color}20`
                              }}
                            >
                              <IconComponent 
                                className="h-8 w-8 transition-all duration-300" 
                                style={{ color: category.color }}
                              />
                            </div>
                            
                            <h3 className="font-bold text-base group-hover:text-slate-900 transition-colors duration-300 text-slate-700">
                              {category.name}
                            </h3>
                            
                            {/* Hover indicator */}
                            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div 
                                className="w-2 h-2 rounded-full mx-auto"
                                style={{ backgroundColor: category.color }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center">
                <Link href="/categories">
                  <Button 
                    size="lg" 
                    className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Browse All Categories
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-slate-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-slate-300/10 to-slate-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 text-sm font-medium mb-8 shadow-sm border border-slate-200">
              <Users className="h-4 w-4" />
              Join Our Community
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-8 leading-tight">
              Ready to Join Our{' '}
              <span className="text-slate-600">
                Amazing Community?
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Whether you want to attend events, organize your own, or simply stay connected 
              with the Sri Lankan community in New Zealand, we have something for everyone. 
              Join thousands of members who are already part of our vibrant community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  className="bg-slate-800 hover:bg-slate-900 text-white text-lg px-10 py-6 font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-lg px-10 py-6 font-semibold rounded-full transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Stats or features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-2">1000+</div>
                <div className="text-slate-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-2">50+</div>
                <div className="text-slate-600">Events Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-2">24/7</div>
                <div className="text-slate-600">Community Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
