import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Event } from '../src/models/event.model.js';
import { Category } from '../src/models/category.model.js';

describe('Events', () => {
  let authToken;
  let adminToken;
  let categoryId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});

    // Create test users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    const organizerUser = await User.create({
      name: 'Organizer User',
      email: 'organizer@example.com',
      password: 'Password123!',
      role: 'organizer',
      isEmailVerified: true,
      isActive: true,
    });

    // Create test category
    const category = await Category.create({
      name: 'Test Category',
      description: 'Test category description',
      color: '#FF6B6B',
      icon: 'calendar',
      createdBy: adminUser._id,
    });

    categoryId = category._id;

    // Get auth tokens
    const adminLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const organizerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'organizer@example.com',
        password: 'Password123!',
      });

    adminToken = adminLoginResponse.body.data.accessToken;
    authToken = organizerLoginResponse.body.data.accessToken;
  });

  describe('GET /api/events', () => {
    it('should return events list', async () => {
      const response = await request(app).get('/api/events').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('events');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter events by category', async () => {
      const response = await request(app)
        .get(`/api/events?category=${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search events', async () => {
      const response = await request(app)
        .get('/api/events?search=test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/events', () => {
    it('should create event with admin token', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test event description',
        category: categoryId,
        startDate: '2024-12-31T10:00:00Z',
        endDate: '2024-12-31T18:00:00Z',
        registrationDeadline: '2024-12-28T23:59:59Z',
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event created successfully');
      expect(response.body.data.event.title).toBe(eventData.title);
    });

    it('should create event with organizer token', async () => {
      const eventData = {
        title: 'Test Event by Organizer',
        description: 'Test event description by organizer',
        category: categoryId,
        startDate: '2024-12-31T10:00:00Z',
        endDate: '2024-12-31T18:00:00Z',
        registrationDeadline: '2024-12-28T23:59:59Z',
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event created successfully');
      expect(response.body.data.event.title).toBe(eventData.title);
    });

    it('should return 401 for unauthenticated request', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test event description',
        category: categoryId,
        startDate: '2024-12-31T10:00:00Z',
        endDate: '2024-12-31T18:00:00Z',
        registrationDeadline: '2024-12-28T23:59:59Z',
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const eventData = {
        title: '', // Invalid: empty title
        description: 'Test event description',
        category: categoryId,
        startDate: '2024-12-31T10:00:00Z',
        endDate: '2024-12-31T18:00:00Z',
        registrationDeadline: '2024-12-28T23:59:59Z',
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create({
        title: 'Test Event',
        description: 'Test event description',
        category: categoryId,
        startDate: new Date('2024-12-31T10:00:00Z'),
        endDate: new Date('2024-12-31T18:00:00Z'),
        registrationDeadline: new Date('2024-12-28T23:59:59Z'),
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
        status: 'published',
        createdBy: (await User.findOne({ role: 'admin' }))._id,
      });

      eventId = event._id;
    });

    it('should return event by id', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.event.title).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/events/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/events/:id/organizer', () => {
    let eventId;
    let organizerEventId;

    beforeEach(async () => {
      const adminUser = await User.findOne({ role: 'admin' });
      const organizerUser = await User.findOne({ role: 'organizer' });

      // Create event by admin
      const adminEvent = await Event.create({
        title: 'Admin Event',
        description: 'Event created by admin',
        category: categoryId,
        startDate: new Date('2024-12-31T10:00:00Z'),
        endDate: new Date('2024-12-31T18:00:00Z'),
        registrationDeadline: new Date('2024-12-28T23:59:59Z'),
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
        status: 'published',
        createdBy: adminUser._id,
      });

      // Create event by organizer
      const organizerEvent = await Event.create({
        title: 'Organizer Event',
        description: 'Event created by organizer',
        category: categoryId,
        startDate: new Date('2024-12-31T10:00:00Z'),
        endDate: new Date('2024-12-31T18:00:00Z'),
        registrationDeadline: new Date('2024-12-28T23:59:59Z'),
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
        status: 'published',
        createdBy: organizerUser._id,
      });

      eventId = adminEvent._id;
      organizerEventId = organizerEvent._id;
    });

    it('should update event by organizer who created it', async () => {
      const updateData = {
        title: 'Updated Organizer Event',
        description: 'Updated description by organizer',
        price: 30,
      };

      const response = await request(app)
        .put(`/api/events/${organizerEventId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event updated successfully');
      expect(response.body.data.event.title).toBe(updateData.title);
      expect(response.body.data.event.price).toBe(updateData.price);
    });

    it('should not allow organizer to update event created by admin', async () => {
      const updateData = {
        title: 'Trying to update admin event',
        price: 30,
      };

      const response = await request(app)
        .put(`/api/events/${eventId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        'Access denied. You can only update events you created'
      );
    });

    it('should return 401 without token', async () => {
      const updateData = {
        title: 'Updated Event',
      };

      const response = await request(app)
        .put(`/api/events/${organizerEventId}/organizer`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const updateData = {
        title: '', // Invalid: empty title
        price: -10, // Invalid: negative price
      };

      const response = await request(app)
        .put(`/api/events/${organizerEventId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/events/:id/organizer', () => {
    let eventId;
    let organizerEventId;

    beforeEach(async () => {
      const adminUser = await User.findOne({ role: 'admin' });
      const organizerUser = await User.findOne({ role: 'organizer' });

      // Create event by admin
      const adminEvent = await Event.create({
        title: 'Admin Event',
        description: 'Event created by admin',
        category: categoryId,
        startDate: new Date('2024-12-31T10:00:00Z'),
        endDate: new Date('2024-12-31T18:00:00Z'),
        registrationDeadline: new Date('2024-12-28T23:59:59Z'),
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
        status: 'published',
        createdBy: adminUser._id,
      });

      // Create event by organizer
      const organizerEvent = await Event.create({
        title: 'Organizer Event',
        description: 'Event created by organizer',
        category: categoryId,
        startDate: new Date('2024-12-31T10:00:00Z'),
        endDate: new Date('2024-12-31T18:00:00Z'),
        registrationDeadline: new Date('2024-12-28T23:59:59Z'),
        location: {
          name: 'Test Venue',
          address: '123 Test Street',
          city: 'Auckland',
        },
        capacity: 100,
        price: 25,
        currency: 'NZD',
        status: 'published',
        createdBy: organizerUser._id,
      });

      eventId = adminEvent._id;
      organizerEventId = organizerEvent._id;
    });

    it('should delete event by organizer who created it', async () => {
      const response = await request(app)
        .delete(`/api/events/${organizerEventId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event deleted successfully');

      // Verify event is deleted
      const deletedEvent = await Event.findById(organizerEventId);
      expect(deletedEvent).toBeNull();
    });

    it('should not allow organizer to delete event created by admin', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        'Access denied. You can only delete events you created'
      );

      // Verify event still exists
      const event = await Event.findById(eventId);
      expect(event).not.toBeNull();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete(`/api/events/${organizerEventId}/organizer`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/events/${fakeId}/organizer`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
