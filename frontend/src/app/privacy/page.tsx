'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Shield, Eye, Lock, Database, Users, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Eye className="h-5 w-5 mr-2" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Kiwi Sri Lankans Events ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our event management platform and services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Database className="h-5 w-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Name, email address, and phone number</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Profile information and preferences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Event registration and attendance data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Payment information (processed securely through third-party providers)</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Event details, descriptions, and images</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Location and venue information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Event categories and tags</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Technical Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>IP address and device information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Browser type and version</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Usage patterns and preferences</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <Users className="h-5 w-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Service Provision</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Process event registrations</li>
                    <li>• Manage user accounts</li>
                    <li>• Provide customer support</li>
                    <li>• Send event notifications</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Communication</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Event updates and reminders</li>
                    <li>• Platform announcements</li>
                    <li>• Marketing communications (with consent)</li>
                    <li>• Respond to inquiries</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Analytics & Improvement</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Analyze usage patterns</li>
                    <li>• Improve platform functionality</li>
                    <li>• Develop new features</li>
                    <li>• Ensure platform security</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Legal Compliance</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Comply with legal obligations</li>
                    <li>• Protect against fraud</li>
                    <li>• Enforce terms of service</li>
                    <li>• Resolve disputes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Lock className="h-5 w-5 mr-2" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Security Measures</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• SSL encryption for data transmission</li>
                  <li>• Secure data storage and processing</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and authentication</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Data Retention</h3>
                <p className="text-sm text-blue-700">
                  We retain your personal information only as long as necessary to provide our services 
                  and comply with legal obligations. Event data may be retained for historical and 
                  analytical purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <Shield className="h-5 w-5 mr-2" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">1</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Access</h3>
                      <p className="text-sm text-gray-600">Request access to your personal data</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">2</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Correction</h3>
                      <p className="text-sm text-gray-600">Correct inaccurate personal information</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">3</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Deletion</h3>
                      <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">4</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Portability</h3>
                      <p className="text-sm text-gray-600">Export your data in a portable format</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">5</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Objection</h3>
                      <p className="text-sm text-gray-600">Object to certain data processing</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-indigo-600 font-semibold text-sm">6</span>
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Withdrawal</h3>
                      <p className="text-sm text-gray-600">Withdraw consent at any time</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-sm text-gray-600">privacy@kiwisrilankans.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">Phone</p>
                      <p className="text-sm text-gray-600">+64 9 123 4567</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-orange-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Address</p>
                      <p className="text-sm text-gray-600">
                        Kiwi Sri Lankans Events<br />
                        Auckland, New Zealand
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              This Privacy Policy is effective as of the date listed above and will remain in effect 
              except with respect to any changes in its provisions in the future, which will be in 
              effect immediately after being posted on this page.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
