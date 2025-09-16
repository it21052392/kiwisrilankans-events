import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Utensils
} from 'lucide-react';

export default function Home() {
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Event Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample Event Cards */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <Music className="h-12 w-12 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Cultural</Badge>
                  <Badge variant="outline">Featured</Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Sri Lankan Cultural Night
                </CardTitle>
                <CardDescription>
                  A wonderful evening celebrating Sri Lankan culture with food, music, and dance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    March 15, 2024
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    6:00 PM - 11:00 PM
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Auckland Town Hall
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      45/200 attendees
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      $25.00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg mb-4 flex items-center justify-center">
                  <Utensils className="h-12 w-12 text-accent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Food & Dining</Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Traditional Sri Lankan Cooking Class
                </CardTitle>
                <CardDescription>
                  Learn to cook authentic Sri Lankan dishes with our expert chefs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    March 22, 2024
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    10:00 AM - 2:00 PM
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Community Kitchen
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      12/20 attendees
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      $45.00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-secondary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Networking</Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Professional Networking Mixer
                </CardTitle>
                <CardDescription>
                  Connect with fellow Sri Lankan professionals in New Zealand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    March 28, 2024
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    5:30 PM - 8:30 PM
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Sky Tower Convention Centre
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      78/100 attendees
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      Free
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/events">
              <Button size="lg" variant="outline">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Cultural', icon: Heart, color: 'text-red-500' },
              { name: 'Food & Dining', icon: Utensils, color: 'text-orange-500' },
              { name: 'Music & Arts', icon: Music, color: 'text-purple-500' },
              { name: 'Sports', icon: Users, color: 'text-green-500' },
              { name: 'Networking', icon: Globe, color: 'text-blue-500' },
              { name: 'Education', icon: Calendar, color: 'text-indigo-500' },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="group hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${category.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
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
