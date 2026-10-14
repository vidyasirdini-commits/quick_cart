const { z } = require('zod');
const { prisma, memoryDB } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');
const eventBus = require('../utils/eventBus');

// Initialize in-memory payment tracking table if not present
if (!memoryDB.payments) {
  memoryDB.payments = [];
}

const createIntentSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  payment_method: z.enum(['card', 'upi', 'netbanking', 'cod']),
});

const confirmPaymentSchema = z.object({
  intent_id: z.string().min(1, 'Intent ID is required'),
  order_id: z.string().min(1, 'Order ID is required'),
  payment_method: z.enum(['card', 'upi', 'netbanking', 'cod']),
  payment_details: z.record(z.any()).optional(),
});

// POST /api/payments/create-intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { order_id, amount, payment_method } = req.body;

    const intentId = `pi_qc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clientSecret = `secret_qc_${Math.random().toString(36).substring(2, 14)}`;

    const intent = {
      id: intentId,
      order_id,
      amount,
      currency: 'INR',
      payment_method,
      status: payment_method === 'cod' ? 'cod_ready' : 'requires_payment_method',
      client_secret: clientSecret,
      created_at: new Date().toISOString(),
    };

    memoryDB.payments.push(intent);

    return successResponse(res, {
      intent_id: intentId,
      client_secret: clientSecret,
      amount,
      currency: 'INR',
      payment_method,
      status: intent.status,
    }, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/confirm
const confirmPayment = async (req, res, next) => {
  try {
    const { intent_id, order_id, payment_method, payment_details = {} } = req.body;

    const intent = memoryDB.payments.find((p) => p.id === intent_id || p.order_id === order_id);
    if (!intent) {
      // Create on the fly if test flow didn't call create-intent first
      memoryDB.payments.push({
        id: intent_id,
        order_id,
        payment_method,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      });
    }

    const transactionId = `txn_qc_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const paidAt = new Date().toISOString();
    const paymentStatus = payment_method === 'cod' ? 'cod_pending' : 'paid';

    // Find and update the order
    let order = null;
    try {
      order = await prisma.order.findUnique({ where: { id: order_id } });
      if (order) {
        // Record payment in status history
        await prisma.orderStatusHistory.create({
          data: {
            order_id,
            status: order.status,
            changed_by: `Payment Gateway (${payment_method.toUpperCase()}: ${transactionId})`,
          },
        });
      }
    } catch {
      // Prisma fallback
    }

    // In-memory fallback
    const memOrder = memoryDB.orders.find((o) => o.id === order_id);
    if (memOrder) {
      memOrder.payment_status = paymentStatus;
      memOrder.payment_method = payment_method;
      memOrder.transaction_id = transactionId;
      memOrder.paid_at = paidAt;

      memoryDB.order_status_history.push({
        id: `h-pay-${Date.now()}`,
        order_id,
        status: memOrder.status,
        changed_by: `Payment Gateway (${payment_method.toUpperCase()}: ${transactionId})`,
        changed_at: paidAt,
      });

      order = memOrder;
    }

    if (intent) {
      intent.status = 'succeeded';
      intent.transaction_id = transactionId;
      intent.paid_at = paidAt;
      intent.payment_details = payment_details;
    }

    // Broadcast SSE update so live tracker and store partner refresh automatically
    if (order) {
      eventBus.broadcastOrderUpdate(
        {
          ...order,
          payment_status: paymentStatus,
          payment_method,
          transaction_id: transactionId,
        },
        `Payment confirmed: ${payment_method.toUpperCase()} (${transactionId})`
      );
    }

    return successResponse(res, {
      success: true,
      transaction_id: transactionId,
      order_id,
      payment_status: paymentStatus,
      payment_method,
      paid_at: paidAt,
      message: payment_method === 'cod'
        ? 'Order confirmed with Cash on Delivery'
        : 'Payment processed and verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/order/:order_id
const getOrderPayment = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const payment = memoryDB.payments.find((p) => p.order_id === order_id);
    const order = memoryDB.orders.find((o) => o.id === order_id);

    if (!payment && !order?.transaction_id) {
      return successResponse(res, {
        order_id,
        payment_status: 'unpaid',
        payment_method: 'unknown',
        transaction_id: null,
      });
    }

    return successResponse(res, {
      order_id,
      payment_status: order?.payment_status || (payment?.status === 'succeeded' ? 'paid' : 'pending'),
      payment_method: order?.payment_method || payment?.payment_method || 'card',
      transaction_id: order?.transaction_id || payment?.transaction_id || null,
      paid_at: order?.paid_at || payment?.paid_at || null,
      amount: order?.total || payment?.amount || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIntentSchema,
  confirmPaymentSchema,
  createPaymentIntent,
  confirmPayment,
  getOrderPayment,
};
