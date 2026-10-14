const request = require('supertest');
const app = require('../server');
const { signToken } = require('../utils/jwt');
const { memoryDB } = require('../models/db');

describe('Admin Analytics, Ledger, Zones & User Controls API', () => {
  let adminToken, customerToken;

  beforeAll(() => {
    const adminUser = memoryDB.users.find(u => u.role === 'admin') || memoryDB.users[0];
    const custUser = memoryDB.users.find(u => u.role === 'customer') || memoryDB.users[2];
    adminToken = signToken(adminUser);
    customerToken = signToken(custUser);
  });

  it('Customer accessing /api/admin/stats should be forbidden with 403', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('Admin should access /api/admin/stats with telemetry metrics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_orders).toBeDefined();
    expect(res.body.data.completion_rate).toBeDefined();
    expect(res.body.data.daily_orders).toBeInstanceOf(Array);
  });

  it('Admin should retrieve filterable transaction ledger', async () => {
    const res = await request(app)
      .get('/api/admin/transactions?date=all&zone=all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.transactions).toBeInstanceOf(Array);
  });

  it('Admin should manage zones and assign fleets', async () => {
    const newZone = await request(app)
      .post('/api/admin/zones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Zone East: New Sector', description: 'Fresh expansion' });

    expect(newZone.statusCode).toBe(201);
    const zoneId = newZone.body.data.id;

    const assignRes = await request(app)
      .post(`/api/admin/zones/${zoneId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ store_name: 'Fresh Basket Supermarket' });

    expect(assignRes.statusCode).toBe(200);
  });

  it('Admin should view user directory and toggle activation', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users?role=all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(usersRes.statusCode).toBe(200);
    expect(usersRes.body.data.length).toBeGreaterThan(0);

    const targetUser = usersRes.body.data.find(u => u.role === 'customer');
    const toggleRes = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/toggle-active`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.body.data.is_active).toBeDefined();
  });
});
