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

  describe('POST /api/events/:id/register', () => {
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

    it('should register user for event', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully registered for event');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
