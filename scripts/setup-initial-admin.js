import mongoose from 'mongoose';
import { AdminWhitelist } from '../src/models/adminWhitelist.model.js';
import { env } from '../src/config/env.js';

async function setupInitialAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    // Get admin email from command line argument
    const adminEmail = process.argv[2];

    if (!adminEmail) {
      // eslint-disable-next-line no-console
      console.error('Please provide an admin email as an argument');
      // eslint-disable-next-line no-console
      console.log(
        'Usage: node scripts/setup-initial-admin.js admin@example.com'
      );
      process.exit(1);
    }

    // Check if email is already whitelisted
    const existingWhitelist = await AdminWhitelist.findOne({
      email: adminEmail.toLowerCase(),
      isActive: true,
    });

    if (existingWhitelist) {
      // eslint-disable-next-line no-console
      console.log(`Email ${adminEmail} is already whitelisted`);
      process.exit(0);
    }

    // Add email to whitelist (for initial setup, we'll use a dummy ObjectId)
    const whitelistEntry = await AdminWhitelist.create({
      email: adminEmail.toLowerCase(),
      addedBy: new mongoose.Types.ObjectId(), // Dummy ObjectId for initial setup
      isActive: true,
    });

    // eslint-disable-next-line no-console
    console.log(`✅ Successfully added ${adminEmail} to admin whitelist`);
    // eslint-disable-next-line no-console
    console.log(`Whitelist entry ID: ${whitelistEntry._id}`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('Next steps:');
    // eslint-disable-next-line no-console
    console.log(`1. Visit: http://localhost:3000/api/auth/google/admin`);
    // eslint-disable-next-line no-console
    console.log(`2. Login with ${adminEmail}`);
    // eslint-disable-next-line no-console
    console.log('3. You will now have admin access');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error setting up initial admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('Disconnected from MongoDB');
  }
}

setupInitialAdmin();
