/**
 * Contact information constants for Kiwi Sri Lankans Events
 * Centralized location for all contact details used throughout the application
 */

export const CONTACT_INFO = {
  // Organization details
  ORGANIZATION: {
    NAME: 'Kiwi Sri Lankans',
    FULL_NAME: 'Kiwi Sri Lankans Events',
    DESCRIPTION: 'Connecting the Sri Lankan community in New Zealand through meaningful events and experiences.',
  },
  
  // Contact details
  CONTACT: {
    EMAIL: 'admin@kiwisrilankans.org',
    PHONE: '+64 20 470 4707',
    ADDRESS: {
      STREET: '1/24, Headcorn Place',
      SUBURB: 'Botany Downs',
      CITY: 'Auckland',
      POSTCODE: '2010',
      COUNTRY: 'New Zealand',
      FULL: '1/24, Headcorn Place, Botany Downs, Auckland 2010, New Zealand',
    },
  },
  
  // Social media and additional contact methods
  SOCIAL: {
    WEBSITE: 'https://kiwisrilankans.org',
    FACEBOOK: 'https://facebook.com/kiwisrilankans',
    INSTAGRAM: 'https://instagram.com/kiwisrilankans',
    LINKEDIN: 'https://linkedin.com/company/kiwisrilankans',
  },
  
  // Support and inquiries
  SUPPORT: {
    EMAIL: 'admin@kiwisrilankans.org',
    GENERAL_INQUIRIES: 'admin@kiwisrilankans.org',
    TECHNICAL_SUPPORT: 'admin@kiwisrilankans.org',
  },
  
  // Business hours and availability
  HOURS: {
    DESCRIPTION: '24/7 Online Platform',
    TIMEZONE: 'NZST/NZDT (New Zealand Standard Time)',
    RESPONSE_TIME: 'We typically respond within 24 hours',
  },
  
  // Community information
  COMMUNITY: {
    MEMBER_COUNT: '2,500+ Members',
    LOCATION: 'Auckland, New Zealand',
    FOCUS: 'Sri Lankan community events and cultural activities',
  },
} as const;

/**
 * Helper function to get formatted contact information
 */
export const getContactInfo = () => CONTACT_INFO;

/**
 * Helper function to get formatted address
 */
export const getFormattedAddress = () => CONTACT_INFO.CONTACT.ADDRESS.FULL;

/**
 * Helper function to get contact email with proper formatting
 */
export const getContactEmail = () => CONTACT_INFO.CONTACT.EMAIL;

/**
 * Helper function to get contact phone with proper formatting
 */
export const getContactPhone = () => CONTACT_INFO.CONTACT.PHONE;

/**
 * Helper function to get organization name
 */
export const getOrganizationName = () => CONTACT_INFO.ORGANIZATION.FULL_NAME;
