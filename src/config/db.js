import mongoose from 'mongoose';
import { logger } from './logger.js';
import { env } from './env.js';

const connectDB = async () => {
  try {
    const mongoURI =
      env.NODE_ENV === 'test'
        ? env.MONGODB_TEST_URI || env.MONGODB_URI
        : env.MONGODB_URI;

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

export { connectDB };
