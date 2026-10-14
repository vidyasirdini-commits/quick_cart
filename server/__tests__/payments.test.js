const request = require('supertest');
const app = require('../server');
const { signToken } = require('../utils/jwt');
const { memoryDB } = require('../models/db');
const eventBus = require('../utils/eventBus');

describe('Mock Payment Gateway & Real-Time Event Bus APIs', () => {
  let customerToken;
  let testOrder;

  beforeAll(() => {
    const custUser = memoryDB.users.find((u) => u.role === 'customer') || memoryDB.users[2];
    customerToken = signToken(custUser);
    testOrder = memoryDB.orders[0];
  });

  describe('Payment Gateway Endpoints', () => {
    it('POST /api/payments/create-intent without token should fail with 401', async () => {
      const res = await request(app).post('/api/payments/create-intent').send({
        order_id: testOrder.id,
        amount: 350,
        payment_method: 'card',
      });
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/payments/create-intent with invalid method should fail with 400', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: testOrder.id,
          amount: 350,
          payment_method: 'bitcoin',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/payments/create-intent with valid card payload should return intent and secret', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          order_id: testOrder.id,
          amount: 350,
          payment_method: 'card',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intent_id).toMatch(/^pi_qc_/);
      expect(res.body.data.client_secret).toMatch(/^secret_qc_/);
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.amount).toBe(350);
    });

    it('POST /api/payments/confirm should process card payment and issue transaction id', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          intent_id: `pi_test_${Date.now()}`,
          order_id: testOrder.id,
          payment_method: 'card',
          payment_details: {
            last4: '4242',
            cardholder: 'Alex Morgan',
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment_status).toBe('paid');
      expect(res.body.data.transaction_id).toMatch(/^txn_qc_/);
      expect(res.body.data.paid_at).toBeDefined();
    });

    it('POST /api/payments/confirm with COD should set status to cod_pending', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          intent_id: `pi_cod_${Date.now()}`,
          order_id: testOrder.id,
          payment_method: 'cod',
          payment_details: {
            cod_confirmed: true,
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment_status).toBe('cod_pending');
      expect(res.body.data.message).toContain('Cash on Delivery');
    });

    it('GET /api/payments/order/:order_id should retrieve payment details', async () => {
      const res = await request(app)
        .get(`/api/payments/order/${testOrder.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order_id).toBe(testOrder.id);
      expect(res.body.data.transaction_id).toBeDefined();
    });
  });

  describe('Server-Sent Events & EventBus', () => {
    it('GET /api/events without auth should reject with 401', async () => {
      const res = await request(app).get('/api/events');
      expect(res.statusCode).toBe(401);
    });

    it('eventBus should emit order_update and new_order events', (done) => {
      let eventsReceived = 0;

      const checkDone = () => {
        eventsReceived += 1;
        if (eventsReceived === 2) done();
      };

      eventBus.once('order_update', (payload) => {
        expect(payload.type).toBe('order_update');
        expect(payload.orderId).toBe(testOrder.id);
        checkDone();
      });

      eventBus.once('new_order', (payload) => {
        expect(payload.type).toBe('new_order');
        expect(payload.orderId).toBe(testOrder.id);
        checkDone();
      });

      eventBus.broadcastOrderUpdate(testOrder, 'Status changed');
      eventBus.broadcastNewOrder(testOrder);
    });
  });
});
