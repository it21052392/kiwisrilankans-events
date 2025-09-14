import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';
import { Event } from '../src/models/event.model.js';
import { logger } from '../src/config/logger.js';

// Load environment variables
config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});
    logger.info('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@kiwisrilankans.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });
    logger.info('Created admin user');

    // Create regular users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: 'Moderator User',
        email: 'moderator@kiwisrilankans.com',
        password: 'Moderator123!',
        role: 'moderator',
        isEmailVerified: true,
        isActive: true,
      },
    ]);
    logger.info('Created regular users');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Cultural Events',
        description: 'Traditional Sri Lankan cultural events and celebrations',
        color: '#FF6B6B',
        icon: 'calendar-heart',
        createdBy: adminUser._id,
        sortOrder: 1,
      },
      {
        name: 'Sports & Recreation',
        description: 'Sports events, tournaments, and recreational activities',
        color: '#4ECDC4',
        icon: 'trophy',
        createdBy: adminUser._id,
        sortOrder: 2,
      },
      {
        name: 'Educational',
        description: 'Workshops, seminars, and educational programs',
        color: '#45B7D1',
        icon: 'book',
        createdBy: adminUser._id,
        sortOrder: 3,
      },
      {
        name: 'Social Gatherings',
        description:
          'Community meetups, networking events, and social activities',
        color: '#96CEB4',
        icon: 'users',
        createdBy: adminUser._id,
        sortOrder: 4,
      },
      {
        name: 'Religious',
        description: 'Religious ceremonies, festivals, and spiritual events',
        color: '#FFEAA7',
        icon: 'church',
        createdBy: adminUser._id,
        sortOrder: 5,
      },
    ]);
    logger.info('Created categories');

    // Create sample events
    const events = await Event.create([
      {
        title: 'Sri Lankan New Year Celebration',
        description:
          'Join us for a traditional Sri Lankan New Year celebration with cultural performances, traditional games, and delicious food. This is a family-friendly event open to all members of the community.',
        category: categories[0]._id,
        startDate: new Date('2024-04-14T10:00:00Z'),
        endDate: new Date('2024-04-14T18:00:00Z'),
        registrationDeadline: new Date('2024-04-10T23:59:59Z'),
        location: {
          name: 'Auckland Community Centre',
          address: '123 Queen Street, Auckland CBD',
          city: 'Auckland',
          coordinates: {
            latitude: -36.8485,
            longitude: 174.7633,
          },
        },
        capacity: 200,
        price: 25,
        currency: 'NZD',
        status: 'published',
        featured: true,
        tags: ['new year', 'cultural', 'family', 'celebration'],
        requirements: ['All ages welcome', 'Traditional attire encouraged'],
        contactInfo: {
          name: 'Event Organizer',
          email: 'events@kiwisrilankans.com',
          phone: '+64 9 123 4567',
        },
        createdBy: adminUser._id,
      },
      {
        title: 'Cricket Tournament',
        description:
          'Annual cricket tournament for the Kiwi Sri Lankan community. Teams will compete in a round-robin format with prizes for winners and runners-up.',
        category: categories[1]._id,
        startDate: new Date('2024-03-15T09:00:00Z'),
        endDate: new Date('2024-03-15T17:00:00Z'),
        registrationDeadline: new Date('2024-03-10T23:59:59Z'),
        location: {
          name: 'Eden Park',
          address: 'Reimers Ave, Mount Eden, Auckland',
          city: 'Auckland',
          coordinates: {
            latitude: -36.8748,
            longitude: 174.7447,
          },
        },
        capacity: 100,
        price: 15,
        currency: 'NZD',
        status: 'published',
        featured: false,
        tags: ['cricket', 'tournament', 'sports', 'competition'],
        requirements: ['Cricket equipment required', 'Team registration'],
        contactInfo: {
          name: 'Sports Coordinator',
          email: 'sports@kiwisrilankans.com',
          phone: '+64 9 234 5678',
        },
        createdBy: adminUser._id,
      },
      {
        title: 'Sinhala Language Workshop',
        description:
          'Learn Sinhala language basics in this interactive workshop. Perfect for beginners and those looking to improve their language skills.',
        category: categories[2]._id,
        startDate: new Date('2024-02-20T18:00:00Z'),
        endDate: new Date('2024-02-20T20:00:00Z'),
        registrationDeadline: new Date('2024-02-18T23:59:59Z'),
        location: {
          name: 'Auckland Library',
          address: '44 Lorne Street, Auckland CBD',
          city: 'Auckland',
          coordinates: {
            latitude: -36.8509,
            longitude: 174.7645,
          },
        },
        capacity: 30,
        price: 0,
        currency: 'NZD',
        status: 'published',
        featured: false,
        tags: ['language', 'workshop', 'education', 'sinhala'],
        requirements: ['Notebook and pen', 'Basic English proficiency'],
        contactInfo: {
          name: 'Education Team',
          email: 'education@kiwisrilankans.com',
          phone: '+64 9 345 6789',
        },
        createdBy: adminUser._id,
      },
      {
        title: 'Community BBQ',
        description:
          'Monthly community BBQ gathering. Bring your family and friends for a fun afternoon of food, games, and socializing.',
        category: categories[3]._id,
        startDate: new Date('2024-02-25T12:00:00Z'),
        endDate: new Date('2024-02-25T16:00:00Z'),
        registrationDeadline: new Date('2024-02-23T23:59:59Z'),
        location: {
          name: 'One Tree Hill Domain',
          address: 'One Tree Hill, Auckland',
          city: 'Auckland',
          coordinates: {
            latitude: -36.9047,
            longitude: 174.7844,
          },
        },
        capacity: 150,
        price: 10,
        currency: 'NZD',
        status: 'published',
        featured: false,
        tags: ['bbq', 'social', 'community', 'family'],
        requirements: ['Bring a dish to share', 'All ages welcome'],
        contactInfo: {
          name: 'Community Coordinator',
          email: 'community@kiwisrilankans.com',
          phone: '+64 9 456 7890',
        },
        createdBy: adminUser._id,
      },
      {
        title: 'Vesak Festival',
        description:
          'Celebrate Vesak, the most important Buddhist festival, with traditional ceremonies, meditation, and community service activities.',
        category: categories[4]._id,
        startDate: new Date('2024-05-23T08:00:00Z'),
        endDate: new Date('2024-05-23T20:00:00Z'),
        registrationDeadline: new Date('2024-05-20T23:59:59Z'),
        location: {
          name: 'Buddhist Temple',
          address: '456 Great South Road, Auckland',
          city: 'Auckland',
          coordinates: {
            latitude: -36.9,
            longitude: 174.8,
          },
        },
        capacity: 300,
        price: 0,
        currency: 'NZD',
        status: 'published',
        featured: true,
        tags: ['vesak', 'buddhist', 'festival', 'spiritual'],
        requirements: ['Respectful attire', 'All faiths welcome'],
        contactInfo: {
          name: 'Temple Coordinator',
          email: 'temple@kiwisrilankans.com',
          phone: '+64 9 567 8901',
        },
        createdBy: adminUser._id,
      },
    ]);
    logger.info('Created sample events');

    // Update category event counts
    for (const category of categories) {
      const eventCount = await Event.countDocuments({ category: category._id });
      category.eventCount = eventCount;
      await category.save();
    }
    logger.info('Updated category event counts');

    logger.info('Seeding completed successfully!');
    logger.info(`Created ${users.length + 1} users`);
    logger.info(`Created ${categories.length} categories`);
    logger.info(`Created ${events.length} events`);
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData;
