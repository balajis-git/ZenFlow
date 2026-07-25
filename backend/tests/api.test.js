const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

// Express App Setup for Test Runner
const app = express();
app.use(express.json());

// Routes Setup
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/employees', require('../routes/employeeRoutes'));
app.use('/api/departments', require('../routes/departmentRoutes'));
app.use('/api/projects', require('../routes/projectRoutes'));
app.use('/api/tasks', require('../routes/taskRoutes'));
app.use('/api/attendance', require('../routes/attendanceRoutes'));
app.use('/api/leaves', require('../routes/leaveRoutes'));
app.use('/api/reports', require('../routes/reportRoutes'));

describe('ZenFlow Enterprise API Test Suite', () => {
  let adminToken;
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow';

  beforeAll(async () => {
    await mongoose.connect(dbUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Authentication Endpoints', () => {
    it('POST /api/auth/login - Should authenticate Super Admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@workflowx.com', password: 'Admin123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      adminToken = res.body.token;
    });

    it('POST /api/auth/login - Should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@workflowx.com', password: 'WrongPassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Protected API Endpoints Verification', () => {
    it('GET /api/employees - Should retrieve employees list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.employees)).toBe(true);
    });

    it('GET /api/departments - Should retrieve department list', async () => {
      const res = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/projects - Should retrieve project portfolio', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/reports/dashboard-analytics - Should retrieve dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard-analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.analytics).toBeDefined();
    });

    it('GET /api/reports/activity-logs - Should retrieve audit trail logs', async () => {
      const res = await request(app)
        .get('/api/reports/activity-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.logs)).toBe(true);
    });
  });
});
