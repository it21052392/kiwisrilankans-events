import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Subscription } from '../src/models/subscription.model.js';

describe('Subscriptions', () => {
  let authToken;
  let adminToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Subscription.deleteMany({});

    // Create test users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
    });

    // Get auth tokens
    const adminLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
    });

    const userLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'Password123!',
    });

    adminToken = adminLoginResponse.body.data.accessToken;
    authToken = userLoginResponse.body.data.accessToken;
  });

  describe('POST /api/subscriptions', () => {
    it('should create email subscription', async () => {
      const subscriptionData = {
        type: 'email',
        preferences: {
          eventReminders: true,
          eventUpdates: true,
          weeklyDigest: true,
          newEvents: true,
        },
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Successfully subscribed to notifications'
      );
      expect(response.body.data.subscription.type).toBe('email');
    });

    it('should create push subscription', async () => {
      const subscriptionData = {
        type: 'push',
        pushSubscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        },
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Successfully subscribed to notifications'
      );
    });

    it('should return 400 for invalid subscription type', async () => {
      const subscriptionData = {
        type: 'invalid',
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 without token', async () => {
      const subscriptionData = {
        type: 'email',
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .send(subscriptionData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/subscriptions/my-subscriptions', () => {
    beforeEach(async () => {
      // Create test subscription
      await Subscription.create({
        user: (await User.findOne({ email: 'user@example.com' }))._id,
        type: 'email',
        status: 'active',
        isVerified: true,
        emailAddress: 'user@example.com',
      });
    });

    it('should return user subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('subscriptions');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscriptions?type=email')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscriptions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/subscriptions/:id', () => {
    let subscriptionId;

    beforeEach(async () => {
      const subscription = await Subscription.create({
        user: (await User.findOne({ email: 'user@example.com' }))._id,
        type: 'email',
        status: 'active',
        isVerified: true,
        emailAddress: 'user@example.com',
      });

      subscriptionId = subscription._id;
    });

    it('should delete subscription', async () => {
      const response = await request(app)
        .delete(`/api/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Successfully unsubscribed from notifications'
      );
    });

    it('should return 404 for non-existent subscription', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/subscriptions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete(`/api/subscriptions/${subscriptionId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/subscriptions/push', () => {
    it('should create push subscription', async () => {
      const pushData = {
        subscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        },
      };

      const response = await request(app)
        .post('/api/subscriptions/push')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pushData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Successfully subscribed to push notifications'
      );
    });

    it('should return 400 for invalid push subscription data', async () => {
      const pushData = {
        subscription: {
          endpoint: 'invalid-url',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        },
      };

      const response = await request(app)
        .post('/api/subscriptions/push')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pushData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});
