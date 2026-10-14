const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createIntentSchema,
  confirmPaymentSchema,
  createPaymentIntent,
  confirmPayment,
  getOrderPayment,
} = require('../controllers/paymentController');

// All payment operations require authentication
router.use(authenticate);

// POST /api/payments/create-intent
router.post('/create-intent', validate(createIntentSchema), createPaymentIntent);

// POST /api/payments/confirm
router.post('/confirm', validate(confirmPaymentSchema), confirmPayment);

// GET /api/payments/order/:order_id
router.get('/order/:order_id', getOrderPayment);

module.exports = router;
