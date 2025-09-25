// Simple test script to verify conflict detection is working
import { conflictDetectionService } from './src/services/conflictDetection.service.js';
import { logger } from './src/config/logger.js';

const testEventData = {
  category: '507f1f77bcf86cd799439011', // Replace with actual category ID
  location: {
    city: 'Auckland',
  },
  startDate: '2024-12-31T10:00:00Z',
  endDate: '2024-12-31T18:00:00Z',
  startTime: '10:00',
  endTime: '18:00',
};

async function testConflictDetection() {
  try {
    logger.info('Testing conflict detection...');
    const result =
      await conflictDetectionService.checkEventConflicts(testEventData);
    logger.info('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    logger.error('Error:', error.message);
  }
}

testConflictDetection();
