'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white border-t border-green-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/images/Logosnew.png"
                alt="Kiwi Sri Lankans Events"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-green-100">
              Connecting the Sri Lankan community in New Zealand through meaningful events and experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-green-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/events/calendar" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Calendar View
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-green-200">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/organizer/dashboard" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-green-100 hover:text-green-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-green-200">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-300" />
                <span className="text-sm text-green-100">info@kiwisrilankans.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-300" />
                <span className="text-sm text-green-100">+64 21 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-300" />
                <span className="text-sm text-green-100">Auckland, New Zealand</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-green-200">
              © 2024 Kiwi Sri Lankans Events. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-green-200 hover:text-green-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-green-200 hover:text-green-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
