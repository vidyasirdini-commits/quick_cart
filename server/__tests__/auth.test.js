const request = require('supertest');
const app = require('../server');
const { signToken } = require('../utils/jwt');
const { memoryDB } = require('../models/db');

describe('Authentication & User Identity API', () => {
  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with invalid email or missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'T',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully register a customer account', async () => {
      const email = `newcust_${Date.now()}@quickcart.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Automated Test Customer',
          email,
          password: 'Password123!',
          role: 'customer',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@quickcart.com',
          password: 'wrong_password_999',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate demo customer successfully and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@quickcart.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('customer');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without Bearer token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return authenticated user profile with valid Bearer token', async () => {
      const user = memoryDB.users[0];
      const token = signToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });
  });
});
