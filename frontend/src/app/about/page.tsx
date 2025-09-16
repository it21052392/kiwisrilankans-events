'use client';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Heart, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Event Discovery',
      description: 'Find and join events that match your interests and schedule'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Connect with fellow Sri Lankans living in New Zealand'
    },
    {
      icon: Heart,
      title: 'Cultural Celebration',
      description: 'Celebrate and preserve Sri Lankan culture and traditions'
    },
    {
      icon: Globe,
      title: 'Networking',
      description: 'Build professional and personal relationships'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Whitelist-based access ensures a trusted community'
    },
    {
      icon: Star,
      title: 'Quality Events',
      description: 'All events are reviewed and approved by administrators'
    }
  ];

  const stats = [
    { number: '150+', label: 'Events Hosted' },
    { number: '2,500+', label: 'Community Members' },
    { number: '25+', label: 'Event Organizers' },
    { number: '12', label: 'Event Categories' }
  ];

  const values = [
    {
      title: 'Community First',
      description: 'We prioritize building strong, meaningful connections within our community.'
    },
    {
      title: 'Cultural Preservation',
      description: 'We celebrate and preserve Sri Lankan culture, traditions, and values.'
    },
    {
      title: 'Inclusivity',
      description: 'We welcome all Sri Lankans regardless of background, age, or experience.'
    },
    {
      title: 'Quality',
      description: 'We maintain high standards for events and community interactions.'
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Kiwi Sri Lankans Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're a community-driven platform that brings together Sri Lankans living in New Zealand 
            through meaningful events, cultural celebrations, and shared experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Explore Events
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              To create a vibrant, connected community of Sri Lankans in New Zealand by providing 
              a platform for meaningful events, cultural exchange, and lasting friendships.
            </p>
            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">What We Do</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Event Management</h4>
                    <p className="text-muted-foreground text-sm">
                      We provide tools for community members to create, manage, and promote events.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Cultural Preservation</h4>
                    <p className="text-muted-foreground text-sm">
                      We celebrate Sri Lankan culture through festivals, food, music, and traditions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Community Building</h4>
                    <p className="text-muted-foreground text-sm">
                      We foster connections between Sri Lankans across different regions of New Zealand.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Quality Assurance</h4>
                    <p className="text-muted-foreground text-sm">
                      We ensure all events meet our standards for safety, quality, and community values.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Join Our Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're new to New Zealand or have been here for years, our community welcomes you. 
              Connect with fellow Sri Lankans, share experiences, and create lasting memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Users className="mr-2 h-5 w-5" />
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Calendar className="mr-2 h-5 w-5" />
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have questions about our platform or want to get involved? We'd love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Location</div>
                <div className="text-sm text-muted-foreground">Auckland, New Zealand</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Hours</div>
                <div className="text-sm text-muted-foreground">24/7 Online Platform</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Community</div>
                <div className="text-sm text-muted-foreground">2,500+ Members</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
