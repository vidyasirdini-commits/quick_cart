const request = require('supertest');
const app = require('../server');
const { signToken } = require('../utils/jwt');
const { memoryDB } = require('../models/db');

describe('Order Lifecycle, Stock Transactions, & State Machine API', () => {
  let customerToken, partnerToken, deliveryToken, adminToken;
  let testStore, testProduct;

  beforeAll(() => {
    const custUser = memoryDB.users.find(u => u.role === 'customer') || memoryDB.users[2];
    const partUser = memoryDB.users.find(u => u.role === 'partner') || memoryDB.users[5];
    const delivUser = memoryDB.users.find(u => u.role === 'delivery') || memoryDB.users[1];
    const admUser = memoryDB.users.find(u => u.role === 'admin') || memoryDB.users[0];

    customerToken = signToken(custUser);
    partnerToken = signToken(partUser);
    deliveryToken = signToken(delivUser);
    adminToken = signToken(admUser);

    testStore = memoryDB.stores[0];
    testProduct = memoryDB.products.find(p => p.store_id === testStore.id && p.stock_qty >= 10);
  });

  it('POST /api/orders without token should fail with 401', async () => {
    const res = await request(app).post('/api/orders').send({
      store_id: testStore.id,
      delivery_address: '123 Street',
      items: [{ product_id: testProduct.id, qty: 1 }],
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/orders with insufficient stock should reject with 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        store_id: testStore.id,
        delivery_address: '123 Green Avenue',
        items: [{ product_id: testProduct.id, qty: 999999 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Customer placing order should create order in placed state', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        store_id: testStore.id,
        delivery_address: 'Flat 402, Green Avenue, Central District',
        items: [{ product_id: testProduct.id, qty: 2 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('placed');
    expect(res.body.data.total).toBeGreaterThan(0);
  });

  it('State Machine: placed -> accepted should decrement stock', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        store_id: testStore.id,
        delivery_address: 'Test Apt 101',
        items: [{ product_id: testProduct.id, qty: 1 }],
      });

    const orderId = orderRes.body.data.id;
    const stockBefore = testProduct.stock_qty;

    const acceptRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'accepted' });

    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.body.data.status).toBe('accepted');
    expect(testProduct.stock_qty).toBe(stockBefore - 1);
  });

  it('Customer cannot cancel after order has been accepted', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        store_id: testStore.id,
        delivery_address: 'Test Apt 102',
        items: [{ product_id: testProduct.id, qty: 1 }],
      });

    const orderId = orderRes.body.data.id;
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'accepted' });

    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'cancelled' });

    expect(cancelRes.statusCode).toBe(400);
    expect(cancelRes.body.success).toBe(false);
  });

  it('Partner can progress accepted -> packed -> out_for_delivery and assign courier', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        store_id: testStore.id,
        delivery_address: 'Test Apt 103',
        items: [{ product_id: testProduct.id, qty: 1 }],
      });

    const orderId = orderRes.body.data.id;
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'accepted' });

    const packedRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'packed' });

    expect(packedRes.statusCode).toBe(200);

    const outRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ status: 'out_for_delivery' });

    expect(outRes.statusCode).toBe(200);
    expect(outRes.body.data.delivery_exec_id).toBeDefined();

    const deliveredRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'delivered' });

    expect(deliveredRes.statusCode).toBe(200);
  });
});
