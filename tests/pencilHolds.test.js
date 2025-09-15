import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Event } from '../src/models/event.model.js';
import { Category } from '../src/models/category.model.js';
import { PencilHold } from '../src/models/pencilHold.model.js';

describe('Pencil Holds', () => {
  let authToken;
  let adminToken;
  let eventId;

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
    await PencilHold.deleteMany({});

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

    // Create test event
    const event = await Event.create({
      title: 'Test Event',
      description: 'Test event description',
      category: category._id,
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

    eventId = event._id;

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

  describe('POST /api/pencil-holds', () => {
    it('should create pencil hold', async () => {
      const pencilHoldData = {
        eventId: eventId,
        notes: 'Test pencil hold notes',
        priority: 5,
      };

      const response = await request(app)
        .post('/api/pencil-holds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pencilHoldData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pencil hold created successfully');
      expect(response.body.data.pencilHold).toHaveProperty('_id');
    });

    it('should return 400 for invalid event ID', async () => {
      const pencilHoldData = {
        eventId: 'invalid-id',
        notes: 'Test pencil hold notes',
      };

      const response = await request(app)
        .post('/api/pencil-holds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pencilHoldData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 without token', async () => {
      const pencilHoldData = {
        eventId: eventId,
        notes: 'Test pencil hold notes',
      };

      const response = await request(app)
        .post('/api/pencil-holds')
        .send(pencilHoldData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for regular user (not organizer)', async () => {
      // Create a regular user
      const regularUser = await User.create({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'Password123!',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
      });

      const regularLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'regular@example.com',
          password: 'Password123!',
        });

      const pencilHoldData = {
        eventId: eventId,
        notes: 'Test pencil hold notes',
      };

      const response = await request(app)
        .post('/api/pencil-holds')
        .set(
          'Authorization',
          `Bearer ${regularLoginResponse.body.data.accessToken}`
        )
        .send(pencilHoldData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pencil-holds', () => {
    beforeEach(async () => {
      // Create test pencil hold
      await PencilHold.create({
        event: eventId,
        user: (await User.findOne({ email: 'organizer@example.com' }))._id,
        status: 'pending',
        notes: 'Test pencil hold',
        createdBy: (await User.findOne({ email: 'organizer@example.com' }))._id,
      });
    });

    it('should return pencil holds list', async () => {
      const response = await request(app).get('/api/pencil-holds').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pencilHolds');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/pencil-holds?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by event', async () => {
      const response = await request(app)
        .get(`/api/pencil-holds?eventId=${eventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/pencil-holds/my-holds', () => {
    beforeEach(async () => {
      // Create test pencil hold
      await PencilHold.create({
        event: eventId,
        user: (await User.findOne({ email: 'organizer@example.com' }))._id,
        status: 'pending',
        notes: 'Test pencil hold',
        createdBy: (await User.findOne({ email: 'organizer@example.com' }))._id,
      });
    });

    it('should return user pencil holds', async () => {
      const response = await request(app)
        .get('/api/pencil-holds/my-holds')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pencilHolds');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/pencil-holds/my-holds')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/pencil-holds/:id/confirm', () => {
    let pencilHoldId;

    beforeEach(async () => {
      const pencilHold = await PencilHold.create({
        event: eventId,
        user: (await User.findOne({ email: 'organizer@example.com' }))._id,
        status: 'pending',
        notes: 'Test pencil hold',
        createdBy: (await User.findOne({ email: 'organizer@example.com' }))._id,
      });

      pencilHoldId = pencilHold._id;
    });

    it('should confirm pencil hold with organizer token', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Pencil hold confirmed successfully. Waiting for admin approval.'
      );
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/confirm`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/pencil-holds/:id/approve', () => {
    let pencilHoldId;

    beforeEach(async () => {
      const pencilHold = await PencilHold.create({
        event: eventId,
        user: (await User.findOne({ email: 'organizer@example.com' }))._id,
        status: 'confirmed',
        notes: 'Test pencil hold',
        createdBy: (await User.findOne({ email: 'organizer@example.com' }))._id,
      });

      pencilHoldId = pencilHold._id;
    });

    it('should approve pencil hold with admin token', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Pencil hold approved successfully. Event is now published.'
      );
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/approve`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/pencil-holds/:id/cancel', () => {
    let pencilHoldId;

    beforeEach(async () => {
      const pencilHold = await PencilHold.create({
        event: eventId,
        user: (await User.findOne({ email: 'organizer@example.com' }))._id,
        status: 'pending',
        notes: 'Test pencil hold',
        createdBy: (await User.findOne({ email: 'organizer@example.com' }))._id,
      });

      pencilHoldId = pencilHold._id;
    });

    it('should cancel pencil hold with admin token', async () => {
      const cancelData = {
        reason: 'Event cancelled',
      };

      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cancelData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pencil hold cancelled successfully');
    });

    it('should return 400 for missing reason', async () => {
      const response = await request(app)
        .patch(`/api/pencil-holds/${pencilHoldId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});
