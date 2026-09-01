import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import './setup.js';

describe('Authentication API (/api/auth)', () => {
  const app = createApp();

  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid credentials and set HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'agent1@xriseai.com',
          password: 'agent1@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('agent1@xriseai.com');
      expect(res.body.data.user.role).toBe('AGENT');
      expect(res.body.data).toHaveProperty('token');

      // Verify Set-Cookie header contains helpdesk_auth_token
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/helpdesk_auth_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should reject invalid password with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'agent1@xriseai.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject unknown user with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@xriseai.com',
          password: 'agent1@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject inactive user with 403 USER_INACTIVE', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@xriseai.com',
          password: 'inactive@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_INACTIVE');
    });

    it('should validate request schema and reject missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me & POST /api/auth/logout', () => {
    it('should return current user when authenticated via Bearer token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@xriseai.com', password: 'admin@123' });

      const token = loginRes.body.data.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe('admin@xriseai.com');
      expect(meRes.body.data.user.role).toBe('ADMIN');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('should successfully clear auth cookie on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
