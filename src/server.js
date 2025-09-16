import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { env } from './config/env.js';

const PORT = env.PORT || 3000;
const HOST = env.HOST || '0.0.0.0';

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});
