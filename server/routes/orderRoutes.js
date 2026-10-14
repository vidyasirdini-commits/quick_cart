const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrderSchema,
  updateStatusSchema,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

// All order routes require authentication
router.use(authenticate);

// POST /api/orders (Customer can place orders, admin also permitted)
router.post('/', authorize('customer', 'admin'), validate(createOrderSchema), createOrder);

// GET /api/orders (Scoped by authenticated user role)
router.get('/', getOrders);

// GET /api/orders/:id (Scoped by role with permissions check)
router.get('/:id', getOrderById);

// PATCH /api/orders/:id/status (Server-enforced role and state transition check)
router.patch('/:id/status', validate(updateStatusSchema), updateOrderStatus);

module.exports = router;
