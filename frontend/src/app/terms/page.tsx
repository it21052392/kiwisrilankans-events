'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileText, Scale, AlertTriangle, Shield, Users, CreditCard, Ban, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
            <Scale className="h-12 w-12 text-green-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our event management platform.
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
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <FileText className="h-5 w-5 mr-2" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Kiwi Sri Lankans Events ("the Platform"), you accept and agree 
                to be bound by the terms and provision of this agreement. If you do not agree to abide 
                by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Platform Description */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Users className="h-5 w-5 mr-2" />
                Platform Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Kiwi Sri Lankans Events is an event management platform that allows users to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Create and manage events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Register for events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Browse event listings</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Manage event bookings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Process payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Communicate with other users</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <Shield className="h-5 w-5 mr-2" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Security</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Maintain the confidentiality of your account credentials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Notify us immediately of any unauthorized use</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Provide accurate and up-to-date information</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Content Guidelines</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Ensure all content is accurate and lawful</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Respect intellectual property rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Do not post offensive or inappropriate content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Comply with all applicable laws and regulations</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Ban className="h-5 w-5 mr-2" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-semibold mb-2">The following activities are strictly prohibited:</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Illegal Activities</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Fraudulent or deceptive practices</li>
                    <li>• Money laundering or terrorist financing</li>
                    <li>• Violation of any applicable laws</li>
                    <li>• Harassment or intimidation</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Platform Abuse</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Attempting to hack or compromise security</li>
                    <li>• Creating multiple accounts to circumvent restrictions</li>
                    <li>• Spamming or unsolicited communications</li>
                    <li>• Reverse engineering or unauthorized access</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Content Violations</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Posting false or misleading information</li>
                    <li>• Infringing on intellectual property rights</li>
                    <li>• Sharing inappropriate or offensive content</li>
                    <li>• Violating privacy of other users</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Commercial Misuse</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Unauthorized commercial activities</li>
                    <li>• Price manipulation or market abuse</li>
                    <li>• Unfair competition practices</li>
                    <li>• Violation of payment terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Payment Processing</h3>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li>• All payments are processed securely through third-party providers</li>
                  <li>• We do not store your payment card information</li>
                  <li>• Refunds are subject to our refund policy</li>
                  <li>• Currency conversion rates may apply for international transactions</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Fees and Charges</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Platform fees are clearly displayed before payment</li>
                  <li>• Additional charges may apply for premium features</li>
                  <li>• Cancellation fees may apply based on event terms</li>
                  <li>• All prices are inclusive of applicable taxes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Event Management */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <Users className="h-5 w-5 mr-2" />
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Creation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Event organizers are responsible for accurate event information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>All events must comply with local laws and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Organizers must honor all commitments made to attendees</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Cancellation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Organizers may cancel events with appropriate notice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Refund policies must be clearly communicated</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>We reserve the right to cancel events that violate our terms</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-l-4 border-l-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm leading-relaxed">
                  To the maximum extent permitted by law, Kiwi Sri Lankans Events shall not be liable 
                  for any indirect, incidental, special, consequential, or punitive damages, including 
                  without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                  resulting from your use of the platform.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Force Majeure</h3>
                <p className="text-sm text-blue-700">
                  We shall not be liable for any failure or delay in performance due to circumstances 
                  beyond our reasonable control, including but not limited to acts of God, natural 
                  disasters, war, terrorism, or government actions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader>
              <CardTitle className="flex items-center text-teal-700">
                <FileText className="h-5 w-5 mr-2" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-teal-800 text-sm leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  material changes through the platform or via email. Your continued use of the platform 
                  after such modifications constitutes acceptance of the updated terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-sm text-gray-600">legal@kiwisrilankans.com</p>
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
              These Terms of Service are governed by the laws of New Zealand. Any disputes arising 
              from these terms will be subject to the exclusive jurisdiction of the courts of New Zealand.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
