'use client';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useCategories } from '@/hooks/queries/useCategories';
import { useEvents } from '@/hooks/queries/useEvents';
import { 
  Calendar, 
  Users, 
  ArrowRight,
  Heart,
  Utensils,
  Music,
  Globe,
  BookOpen,
  Gamepad2,
  Camera,
  Briefcase,
  Home,
  Laptop,
  Palette,
  MapPin,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, any> = {
  // Original mappings
  'cultural': Heart,
  'food': Utensils,
  'music': Music,
  'sports': Gamepad2,
  'networking': Globe,
  'education': BookOpen,
  'photography': Camera,
  'business': Briefcase,
  'home': Home,
  // New popular category mappings
  'food & dining': Utensils,
  'music & entertainment': Music,
  'health & wellness': Heart,
  'business & networking': Briefcase,
  'family & kids': Home, // Using Home icon for family
  'technology': Laptop,
  'arts & crafts': Palette,
  'travel & tourism': MapPin,
  'volunteer & charity': Users, // Using Users icon for charity/volunteer
  'fashion & beauty': Sparkles,
  'default': Calendar,
};

export default function CategoriesPage() {
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: eventsData } = useEvents({ limit: 1000 }); // Get all events for counting

  const categories = categoriesData?.data?.categories || [];
  const events = eventsData?.data?.events || [];

  // Count events per category
  const getEventCountForCategory = (categoryId: string) => {
    return events.filter(event => event.category?._id === categoryId).length;
  };

  if (categoriesLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (categoriesError) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="Error Loading Categories"
            description="There was an error loading the categories. Please try again later."
          />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Event Categories
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore events by category and find what interests you most
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="No Categories Found"
            description="No categories are available at the moment. Check back later!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const eventCount = getEventCountForCategory(category._id);
              const IconComponent = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
              
              return (
                <Link key={category._id} href={`/events?category=${category._id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="text-center pb-4">
                      <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent 
                          className="h-8 w-8" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge 
                          variant="secondary" 
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color,
                            borderColor: category.color
                          }}
                        >
                          {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        View Events
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Categories Section */}
        {categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories
                .sort((a, b) => getEventCountForCategory(b._id) - getEventCountForCategory(a._id))
                .slice(0, 6)
                .map((category) => {
                  const eventCount = getEventCountForCategory(category._id);
                  const IconComponent = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
                  
                  return (
                    <Link key={category._id} href={`/events?category=${category._id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer text-center">
                        <CardContent className="p-4">
                          <div 
                            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent 
                              className="h-6 w-6" 
                              style={{ color: category.color }}
                            />
                          </div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Browse all events or create your own event to share with the community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Browse All Events
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Become an Organizer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
