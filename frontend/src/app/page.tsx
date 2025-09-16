'use client';

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/events/EventCard';
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
  });
  
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
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Connect with the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Sri Lankan Community
              </span>{' '}
              in New Zealand
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, create, and join meaningful events that celebrate our culture, 
              build connections, and strengthen our community bonds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="text-lg px-8 py-6">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events/calendar">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          {statsLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.events?.published || 0}+
                </div>
                <div className="text-muted-foreground">Events Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.users?.total || 0}+
                </div>
                <div className="text-muted-foreground">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.users?.organizers || 0}+
                </div>
                <div className="text-muted-foreground">Event Organizers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.categories?.active || 0}
                </div>
                <div className="text-muted-foreground">Categories</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular and upcoming events in our community
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    variant="featured"
                    showActions={false}
                  />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/events">
                  <Button size="lg" variant="outline">
                    View All Events
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Event Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find events that match your interests and passions
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories.map((category) => {
                  const IconComponent = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
                  return (
                    <Link key={category._id} href={`/events?category=${category._id}`}>
                      <Card className="group hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                          <div 
                            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent 
                              className="h-6 w-6 group-hover:scale-110 transition-transform" 
                              style={{ color: category.color }}
                            />
                          </div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-12">
                <Link href="/categories">
                  <Button size="lg" variant="outline">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you want to attend events, organize your own, or simply stay connected 
              with the Sri Lankan community in New Zealand, we have something for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
