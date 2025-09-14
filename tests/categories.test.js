import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';

describe('Categories', () => {
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

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      // Create test categories
      await Category.create([
        {
          name: 'Cultural Events',
          description: 'Traditional cultural events',
          color: '#FF6B6B',
          icon: 'calendar-heart',
          createdBy: (await User.findOne({ role: 'admin' }))._id,
          sortOrder: 1,
        },
        {
          name: 'Sports & Recreation',
          description: 'Sports and recreational activities',
          color: '#4ECDC4',
          icon: 'trophy',
          createdBy: (await User.findOne({ role: 'admin' }))._id,
          sortOrder: 2,
        },
      ]);
    });

    it('should return categories list', async () => {
      const response = await request(app).get('/api/categories').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.categories).toHaveLength(2);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/categories?active=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories.every(cat => cat.active)).toBe(true);
    });

    it('should search categories', async () => {
      const response = await request(app)
        .get('/api/categories?search=cultural')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].name).toBe('Cultural Events');
    });
  });

  describe('POST /api/categories', () => {
    it('should create category with admin token', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
        sortOrder: 1,
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category created successfully');
      expect(response.body.data.category.name).toBe(categoryData.name);
    });

    it('should return 403 for non-admin user', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const categoryData = {
        name: '', // Invalid: empty name
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 without token', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
        createdBy: (await User.findOne({ role: 'admin' }))._id,
      });

      categoryId = category._id;
    });

    it('should return category by id', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category.name).toBe('Test Category');
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/categories/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
        createdBy: (await User.findOne({ role: 'admin' }))._id,
      });

      categoryId = category._id;
    });

    it('should update category with admin token', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
        color: '#4ECDC4',
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category updated successfully');
      expect(response.body.data.category.name).toBe(updateData.name);
    });

    it('should return 403 for non-admin user', async () => {
      const updateData = {
        name: 'Updated Category',
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
        createdBy: (await User.findOne({ role: 'admin' }))._id,
      });

      categoryId = category._id;
    });

    it('should delete category with admin token', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category deleted successfully');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/categories/:id/toggle', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await Category.create({
        name: 'Test Category',
        description: 'Test category description',
        color: '#FF6B6B',
        icon: 'calendar',
        createdBy: (await User.findOne({ role: 'admin' }))._id,
        active: true,
      });

      categoryId = category._id;
    });

    it('should toggle category status with admin token', async () => {
      const response = await request(app)
        .patch(`/api/categories/${categoryId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category deactivated successfully');
      expect(response.body.data.category.active).toBe(false);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .patch(`/api/categories/${categoryId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
